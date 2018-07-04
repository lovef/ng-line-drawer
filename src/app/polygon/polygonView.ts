import { Polygon } from './polygon'
import { Point } from './point'

export interface Configuration {
    vertices: number
    angle: number
    radius: number
    x: number
    y: number
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

    private configuration: Configuration = null

    private oldPositionA: Point
    private oldPositionB: Point

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.polygon = new Polygon(new Point(width / 2, height), 1, 87, - Math.PI / 2)
        this.polygon = this.polygon.changeRadiusTo(height / this.polygon.calculateCircleRadius(7))
    }

    config(configuration: Configuration = null): Configuration {
        if (configuration) {
            this.polygon = new Polygon(
                new Point(
                    configuration.x * this.width / 100,
                    configuration.y * this.height / 100),
                configuration.radius,
                configuration.vertices,
                configuration.angle * Math.PI / 180)
            this.configuration = configuration
        }
        return this.configuration || {
            vertices: this.polygon.pointsCount,
            angle: this.round(((this.polygon.startAngle * 180 / Math.PI) % 360 + 360) % 360),
            radius: this.round(this.polygon.radius),
            x: this.round(100 * this.polygon.center.x / this.width),
            y: this.round(100 * this.polygon.center.y / this.height)
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
