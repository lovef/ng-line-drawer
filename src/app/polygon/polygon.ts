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

export class Circle implements Iterable<Line> {

    constructor(readonly polygon: Polygon, readonly circleIndex) { }

    [Symbol.iterator](): Iterator<Line> {
        return new CirclePointIterator(this.polygon, this.circleIndex)
    }
}

export class CircleIterator implements Iterator<Circle> {

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
        return this.iterator()
    }

    iterator(): CircleIterator {
        return new CircleIterator(this.polygon, this.start, this.end)
    }
}

export class Polygon {

    points = []
    circleCount: number
    angle: number

    constructor(
        readonly center: Point,
        readonly radius: number,
        readonly pointsCount: number,
        readonly startAngle = Math.PI / 2
    ) {
        this.angle = 2 * Math.PI / pointsCount
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

    getCircleIterable(start = 0, end: number = null): CircleIterable {
        if (end === null || end - start > this.circleCount) {
            end = start + this.circleCount - 1
        }
        return new CircleIterable(this, start, end)
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
        return new Polygon(newCenter, this.radius * scale, this.pointsCount, this.startAngle)
    }

    changeRadiusTo(newRadius: number): Polygon {
        return new Polygon(this.center, newRadius, this.pointsCount, this.startAngle)
    }

    moveTo(position: Point): Polygon {
        return new Polygon(position, this.radius, this.pointsCount, this.startAngle)
    }

    move(delta: Point): Polygon {
        return new Polygon(this.center.plus(delta), this.radius, this.pointsCount, this.startAngle)
    }

    rotate(delta: number): Polygon {
        return new Polygon(this.center, this.radius, this.pointsCount, this.startAngle + delta)
    }
}
