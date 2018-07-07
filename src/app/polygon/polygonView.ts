import { Polygon, Circle, CircleIterator } from './polygon'
import { Point } from './point'

export interface ConfigurationModel {
    config: string,
    selectionStart: number
    selectionEnd: number
}

export interface Configuration {
    vertices: number,
    startCircle: number,
    circleCount: number,
    colors: string[],
    angle: number
    radius: number
    x: number
    y: number
}

class CircleViewConfig {
    constructor(
        readonly circle: Circle,
        readonly color: string
    ) { }
}

class CircleViewIterator implements Iterator<CircleViewConfig> {

    index = 0
    current: number
    circleIterator: CircleIterator

    constructor(readonly polygon: PolygonView, readonly start, readonly end) {
        this.current = start
        this.circleIterator = polygon.polygon.getCircleIterable(start, end).iterator()
    }

    next(): IteratorResult<CircleViewConfig> {
        const next = this.circleIterator.next()
        if (!next.value) {
            return { done: true, value: undefined }
        }
        const circleViewConfig = new CircleViewConfig(
            next.value,
            this.polygon.colors[this.index % this.polygon.colors.length])
        this.index++
        return {
            done: false,
            value: circleViewConfig
        }
    }
}

class CircleViewIterable implements Iterable<CircleViewConfig> {

    constructor(readonly polygonView: PolygonView, readonly start: number, readonly end: number) { }

    [Symbol.iterator](): Iterator<CircleViewConfig> {
        return new CircleViewIterator(this.polygonView, this.start, this.end)
    }
}

export class PolygonView {

    width: number
    height: number

    _polygon: Polygon
    get polygon(): Polygon { return this._polygon }
    set polygon(p: Polygon) {
        this.configuration = null
        this._polygon = p
    }

    colors = [
        '#FF0000',
        '#FF8000',
        '#FFFF00',
        '#008000',
        '#0000FF',
        '#A000C0'
    ].reverse()

    startCircle = 0
    circleCount = this.colors.length

    private configuration: Configuration = null

    private oldPositionA: Point
    private oldPositionB: Point

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.polygon = new Polygon(new Point(width / 2, height), 1, 87, - Math.PI / 2)
        this.polygon = this.polygon.changeRadiusTo(height / this.polygon.calculateCircleRadius(7))
    }

    getCircleViewIterable(): CircleViewIterable {
        return new CircleViewIterable(this, this.startCircle, this.startCircle + this.circleCount - 1)
    }

    config(configuration: Configuration = null): Configuration {
        if (configuration) {
            this.polygon = new Polygon(
                new Point(
                    configuration.x * this.width / 100,
                    configuration.y * this.height / 100),
                configuration.radius * Math.max(this.width, this.height) / 100,
                configuration.vertices,
                configuration.angle * Math.PI / 180)
            this.startCircle = configuration.startCircle
            this.circleCount = configuration.circleCount
            this.colors = configuration.colors.slice().reverse()
            this.configuration = configuration
        }
        return this.configuration || {
            vertices: this.polygon.pointsCount,
            startCircle: this.startCircle,
            circleCount: this.circleCount,
            colors: this.colors.slice().reverse(),
            angle: this.round(((this.polygon.startAngle * 180 / Math.PI) % 360 + 360) % 360),
            radius: this.round(100 * this.polygon.radius / Math.max(this.width, this.height)),
            x: this.round(100 * this.polygon.center.x / this.width),
            y: this.round(100 * this.polygon.center.y / this.height)
        }
    }

    manipulateJson(json: String, selectionStart: number, direction: number): ConfigurationModel {
        let endIndex = json.indexOf(',', selectionStart) || json.length - 1
        if (endIndex < 0) {
            endIndex = json.length - 1
        }
        let startIndex = json.substring(0, endIndex).lastIndexOf(',')
        if (startIndex < 0) {
            startIndex = 0
        }
        const jsonLine = json.substring(startIndex, endIndex).trim()
        const propertyMatch = /("[^"]+":\s*)([^,]+)/.exec(jsonLine)
        const delta = direction > 0 ? 1 : -1
        const newProperty = propertyMatch[1] + this.round(Number(propertyMatch[2]) + delta)
        const updatedJson = json.replace(propertyMatch[0], newProperty)
        return {
            config: updatedJson,
            selectionStart: startIndex + propertyMatch.index + propertyMatch[1].length,
            selectionEnd: startIndex + propertyMatch.index + newProperty.length
        }
    }

    refreshConfig() {
        this.configuration = null
    }

    private round(n: number): number {
        return Math.round(n * 1000000) / 1000000
    }

    relativePosition(): Point {
        return new Point(this.polygon.center.x / this.width, this.polygon.center.y / this.height)
    }

    resize(width, height) {
        const originalRelativePosition = this.relativePosition()
        const oldMaxSize = Math.max(this.width, this.height)
        this.width = width
        this.height = height
        this.polygon = this.polygon
            .moveTo(new Point(width * originalRelativePosition.x, height * originalRelativePosition.y))
            .changeRadiusTo(this.polygon.radius * Math.max(width, height) / oldMaxSize)
    }

    scale(position: Point, scale: number) {
        this.polygon = this.polygon.scale(position, scale)
    }

    move(delta: Point) {
        this.polygon = this.polygon.move(delta)
    }

    rotate(delta: number) {
        this.polygon = this.polygon.rotate(delta)
    }

    rotateBetween(from: Point, to: Point) {
        const a = from.minus(this.polygon.center)
        const b = to.minus(this.polygon.center)
        this.polygon = this.polygon.rotate(b.angleFrom(a))
    }

    touch(positionA: Point, positionB: Point = null) {
        if (this.oldPositionA && this.oldPositionB) {
            if (positionA.lengthSquaredTo(this.oldPositionA) > positionA.lengthSquaredTo(this.oldPositionB)) {
                const tmp = this.oldPositionA
                this.oldPositionA = this.oldPositionB
                this.oldPositionB = tmp
            }
        }

        if (positionA && this.oldPositionA && positionB && this.oldPositionB) {
            this.moveWithTouch(
                this.oldPositionA, positionA,
                this.oldPositionB, positionB)

        } else if (positionA && this.oldPositionA) {
            const move = positionA.minus(this.oldPositionA)
            this.polygon = this.polygon.move(move)
        }

        this.oldPositionA = positionA
        this.oldPositionB = positionB
    }

    stopTouch() {
        this.oldPositionA = null
        this.oldPositionB = null
    }

    private moveWithTouch(
        A0: Point, A: Point,
        B0: Point, B: Point
    ) {
        const C0 = this.polygon.center
        const AB = B.minus(A)
        const A0B0 = B0.minus(A0)
        const angle = AB.angleFrom(A0B0)
        const scale = AB.length() / A0B0.length()
        const C = C0.minus(A0).rotate(angle).multiply(scale).plus(A)
        this.polygon = new Polygon(C,
            this.polygon.radius * scale,
            this.polygon.pointsCount,
            this.polygon.startAngle + angle)
    }
}
