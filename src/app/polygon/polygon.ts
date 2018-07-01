import { Point } from './point'

export class Line {
    constructor(readonly start: Point, readonly end: Point) { }

    toString(): String {
        return this.start + ' - ' + this.end
    }
}

class CirclePointIterator implements Iterator<Line> {

    current = 0
    skips: number

    constructor(readonly polygon: Polygon, readonly circleIndex) {
        this.skips = polygon.circleCount - circleIndex
    }

    next(): IteratorResult<Line> {
        if (this.current >= this.polygon.points.length) {
            return { done: true, value: undefined }
        }
        const line = new Line(
            this.polygon.points[this.current],
            this.polygon.points[(this.current + this.skips) % this.polygon.points.length])
        this.current++
        return {
            done: false,
            value: line
        }
    }
}

class Circle implements Iterable<Line> {

    constructor(readonly polygon: Polygon, readonly circleIndex) { }

    [Symbol.iterator](): Iterator<Line> {
        return new CirclePointIterator(this.polygon, this.circleIndex)
    }
}

class CircleIterator implements Iterator<Circle> {

    current: number

    constructor(readonly polygon: Polygon, start: number, readonly end: number) {
        this.current = start
    }

    next(): IteratorResult<Circle> {
        if (this.current > this.end) {
            return { done: true, value: undefined }
        }
        const circle = new Circle(this.polygon, this.current)
        this.current++
        return {
            done: false,
            value: circle
        }
    }
}

class CircleIterable implements Iterable<Circle> {

    constructor(readonly polygon: Polygon, readonly start: number, readonly end: number) { }

    [Symbol.iterator](): Iterator<Circle> {
        return new CircleIterator(this.polygon, this.start, this.end)
    }
}

export class Polygon {

    points = []
    circleCount: number
    angle: number

    constructor(readonly center: Point, readonly radius: number, readonly pointsCount: number) {
        this.angle = 2 * Math.PI / pointsCount
        const startAngle = Math.PI / 2
        this.points = Array.from({ length: pointsCount }, (value, key) => new Point(
            Math.cos(-key * this.angle + startAngle),
            Math.sin(-key * this.angle + startAngle))
            .multiply(radius).plus(center))

        this.circleCount = Math.floor(pointsCount / 2)
    }

    getCircle(circleIndex: number): Circle {
        if (circleIndex < 0 || circleIndex >= this.circleCount) {
            return undefined
        }
        return new Circle(this, circleIndex)
    }

    getCircleIterable(start = 0, end?: number): CircleIterable {
        return new CircleIterable(this, start, end || this.circleCount - 1)
    }

    calculateCircleRadius(circleIndex: number): number {
        if (circleIndex >= this.circleCount) {
            return this.radius
        }
        return this.radius * Math.sin(this.angle * circleIndex / 2)
    }

    scale(position: Point, scale: number): Polygon {
        const centerDiff = this.center.minus(position)
        const newCenter = position.plus(centerDiff.multiply(scale))
        return new Polygon(newCenter, this.radius * scale, this.pointsCount)
    }

    changeRadiusTo(newRadius: number): Polygon {
        return new Polygon(this.center, newRadius, this.pointsCount)
    }

    moveTo(position: Point): Polygon {
        return new Polygon(position, this.radius, this.pointsCount)
    }
}
