import { Point } from './point'
import { Polygon, Line } from './polygon'

function fail(message: String, actual, expected) {
    throw new Error(message + '\n' +
        'Expected: ' + expected + '\n' +
        'Actual:   ' + actual)
}

function matches(a: Point, b: Point) {
    const threshhold = 0.000001
    return Math.abs(a.x - b.x) < threshhold && Math.abs(a.y - b.y) < threshhold
}

class PointsMatcher {

    constructor(readonly expectedPoints: Point[]) { }

    shouldBeIn(polygon: Polygon) {
        if (polygon.points.length !== this.expectedPoints.length) {
            fail('Point arrays lengths missmatch', polygon.points, this.expectedPoints)
        }
        for (let i = 0; i < polygon.points.length; i++) {
            if (!matches(polygon.points[i], this.expectedPoints[i])) {
                fail('Point arrays differ at index ' + i, polygon.points, this.expectedPoints)
            }
        }
    }

    map(callbackfn: (value: Point, index: number, array: Point[]) => Point, thisArg?: any): PointsMatcher {
        return new PointsMatcher(this.expectedPoints.map(callbackfn))
    }
}

function points(...expectedPoints: Point[]) {
    return new PointsMatcher(expectedPoints)
}

describe('Polygon', () => {

    it('has the correct points', () => {
        points().shouldBeIn(new Polygon(Point.Zero, 1, 0))
        points(Point.Y).shouldBeIn(new Polygon(Point.Zero, 1, 1))
        points(Point.Y, Point.X, Point.Yminus, Point.Xminus).map(p => p.multiply(2).plus(Point.X))
            .shouldBeIn(new Polygon(Point.X, 2, 4))
        points(Point.Y, Point.X, Point.Yminus, Point.Xminus).map(p => p.multiply(2).plus(Point.Y))
            .shouldBeIn(new Polygon(Point.Y, 2, 4))
    })

    it('has the correct number of circles', () => {
        expect(new Polygon(Point.Zero, 1, 3).circleCount).toBe(1)
        expect(new Polygon(Point.Zero, 1, 4).circleCount).toBe(2)
        expect(new Polygon(Point.Zero, 1, 5).circleCount).toBe(2)
        expect(new Polygon(Point.Zero, 1, 6).circleCount).toBe(3)
        expect(new Polygon(Point.Zero, 1, 7).circleCount).toBe(3)
        expect(new Polygon(Point.Zero, 1, 8).circleCount).toBe(4)
    })

    it('has circles with expected points', () => {
        const polygon = new Polygon(Point.Zero, 1, 4)
        expect(Array.from(polygon.getCircle(0))).toEqual([
            new Line(polygon.points[0], polygon.points[2]),
            new Line(polygon.points[1], polygon.points[3]),
            new Line(polygon.points[2], polygon.points[0]),
            new Line(polygon.points[3], polygon.points[1]),
        ])
        expect(Array.from(polygon.getCircle(1))).toEqual([
            new Line(polygon.points[0], polygon.points[1]),
            new Line(polygon.points[1], polygon.points[2]),
            new Line(polygon.points[2], polygon.points[3]),
            new Line(polygon.points[3], polygon.points[0]),
        ])
        expect(polygon.getCircle(-1)).toBeUndefined()
        expect(polygon.getCircle(2)).toBeUndefined()
    })

    it('can iterate over the circles', () => {
        const polygon = new Polygon(Point.Zero, 1, 4)
        expect(Array.from(polygon.getCircleIterable()).map((a) => a.circleIndex)).toEqual([0, 1])
    })

    it('can iterate over a subset of the circles', () => {
        const polygon = new Polygon(Point.Zero, 1, 10)
        expect(Array.from(polygon.getCircleIterable(3, 2)).map((a) => a.circleIndex)).toEqual([])
        expect(Array.from(polygon.getCircleIterable(3, 3)).map((a) => a.circleIndex)).toEqual([3])
        expect(Array.from(polygon.getCircleIterable(0, 2)).map((a) => a.circleIndex)).toEqual([0, 1, 2])
        expect(Array.from(polygon.getCircleIterable(1, 3)).map((a) => a.circleIndex)).toEqual([1, 2, 3])
        expect(Array.from(polygon.getCircleIterable(0, 100)).map((a) => a.circleIndex).length).toEqual(polygon.circleCount)
        expect(Array.from(polygon.getCircleIterable(5, 100)).map((a) => a.circleIndex).length).toEqual(polygon.circleCount)
    })

    it('can iterate over circles with for loop', () => {
        const polygon = new Polygon(Point.Zero, 1, 4)
        const iterated = []
        for (const circle of polygon.getCircleIterable()) {
            iterated.push(circle)
        }
        expect(iterated).toEqual(Array.from(polygon.getCircleIterable()))
    })

    it('can calculate circle radius', () => {
        const r = Math.random()
        const polygon = new Polygon(Point.Zero, r, 4)
        expect(polygon.calculateCircleRadius(0)).toEqual(0)
        expect(polygon.calculateCircleRadius(1)).toBeCloseTo(r * Math.sqrt(0.5 * 0.5 * 2))
        expect(polygon.calculateCircleRadius(2)).toBeCloseTo(r)
        expect(polygon.calculateCircleRadius(3)).toEqual(r)
    })

    it('can be scaled', () => {
        const scale = Math.random()
        const position = new Point(Math.random(), Math.random())
        const polygon = new Polygon(new Point(1 + Math.random(), 1 + Math.random()), 1, 4, Math.random())
        const centerDiff = polygon.center.minus(position)

        const newPolygon = polygon.scale(position, scale)

        expect(newPolygon.radius).toEqual(polygon.radius * scale)
        expect(newPolygon.center).toEqual(position.plus(centerDiff.multiply(scale)))
        expect(newPolygon.circleCount).toEqual(polygon.circleCount)
        expect(newPolygon.startAngle).toBeCloseTo(polygon.startAngle)
    })

    it('can change radius', () => {
        const newRadius = Math.random()
        const polygon = new Polygon(new Point(Math.random(), Math.random()), 1, 4, Math.random())
        const newPolygon = polygon.changeRadiusTo(newRadius)
        expect(newPolygon.radius).toEqual(newRadius)
        expect(newPolygon.center).toEqual(polygon.center)
        expect(newPolygon.circleCount).toEqual(polygon.circleCount)
        expect(newPolygon.startAngle).toBeCloseTo(polygon.startAngle)
    })

    it('can be moved to an absolute position', () => {
        const newPosition = new Point(Math.random(), Math.random())
        const polygon = new Polygon(new Point(Math.random(), Math.random()), 1, 4, Math.random())
        const newPolygon = polygon.moveTo(newPosition)
        expect(newPolygon.radius).toEqual(polygon.radius)
        expect(newPolygon.center).toBe(newPosition)
        expect(newPolygon.circleCount).toEqual(polygon.circleCount)
        expect(newPolygon.startAngle).toBeCloseTo(polygon.startAngle)
    })

    it('can be moved', () => {
        const delta = new Point(Math.random(), Math.random())
        const polygon = new Polygon(new Point(Math.random(), Math.random()), 1, 4, Math.random())
        const newPolygon = polygon.move(delta)
        expect(newPolygon.radius).toEqual(polygon.radius)
        const expectedPosition = polygon.center.plus(delta)
        expect(newPolygon.center.x).toBeCloseTo(expectedPosition.x)
        expect(newPolygon.center.y).toBeCloseTo(expectedPosition.y)
        expect(newPolygon.circleCount).toEqual(polygon.circleCount)
        expect(newPolygon.startAngle).toBeCloseTo(polygon.startAngle)
    })

    it('can be rotated', () => {
        const polygon = new Polygon(new Point(Math.random(), Math.random()), 1, 4, Math.random())
        const angle = Math.random()
        const newPolygon = polygon.rotate(angle)
        expect(newPolygon.radius).toEqual(polygon.radius)
        expect(newPolygon.center).toBe(polygon.center)
        expect(newPolygon.circleCount).toEqual(polygon.circleCount)
        expect(newPolygon.startAngle).toBeCloseTo(polygon.startAngle + angle)
    })
})
