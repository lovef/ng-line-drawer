import { Point } from './point'

function fail(message: String, actual, expected) {
    throw new Error(message + '\n' +
        'Expected: ' + expected + '\n' +
        'Actual:   ' + actual)
}

function matches(a: Point, b: Point) {
    const threshhold = 0.000001
    return Math.abs(a.x - b.x) < threshhold && Math.abs(a.y - b.y) < threshhold
}

class PointMatcher {
    constructor(readonly a: Point) { }

    shouldBeCloseTo(b: Point) {
        if (!matches(this.a, b)) {
            fail('Points should match', this.a, b)
        }
    }
}

function point(a: Point): PointMatcher {
    return new PointMatcher(a)
}

class PointsMatcher {

    constructor(readonly expectedPoints: Point[]) { }

    shouldBeCloseTo(...actualPoints: Point[]) {
        if (actualPoints.length !== this.expectedPoints.length) {
            fail('Point arrays lengths missmatch', actualPoints, this.expectedPoints)
        }
        for (let i = 0; i < actualPoints.length; i++) {
            if (!matches(actualPoints[i], this.expectedPoints[i])) {
                fail('Point arrays differ at index ' + i, actualPoints, this.expectedPoints)
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

describe('Point', () => {
    it('(a, b) + (c, d) = (a + c, b + d)', () => {
        expect(new Point(1, 2).plus(new Point(3, 4))).toEqual(new Point(4, 6))
    })

    it('(a, b) - (c, d) = (a - c, b - d)', () => {
        expect(new Point(4, 6).minus(new Point(3, 4))).toEqual(new Point(1, 2))
    })

    it('(a, b) * x = (a * x, b * x)', () => {
        expect(new Point(1, 2).multiply(3)).toEqual(new Point(3, 6))
    })

    it('can calculate length', () => {
        expect(new Point(3, 4).length()).toEqual(5)
    })

    it('can calculate length to another point', () => {
        expect(Point.Zero.lengthTo(new Point(3, 4))).toEqual(5)
    })

    it('can calculate length squared to another point', () => {
        expect(Point.Zero.lengthSquaredTo(new Point(3, 4))).toEqual(25)
    })

    it('can calculate the angle', () => {
        expect(Point.X.angle() / Math.PI).toEqual(0)
        expect(Point.Y.angle() / Math.PI).toBeCloseTo(0.5)
        expect(Point.Xminus.angle() / Math.PI).toBeCloseTo(1)
        expect(Point.Yminus.angle() / Math.PI).toBeCloseTo(1.5)
    })

    it('can calculate the angle from other point', () => {
        expect(Point.X.angleFrom(Point.X) / Math.PI).toEqual(0)
        expect(Point.X.angleFrom(Point.Y) / Math.PI).toEqual(1.5)
        expect(Point.X.angleFrom(Point.Yminus) / Math.PI).toEqual(0.5)

        expect(Point.Y.angleFrom(Point.Y) / Math.PI).toEqual(0)
        expect(Point.Y.angleFrom(Point.Xminus) / Math.PI).toEqual(1.5)
        expect(Point.Y.angleFrom(Point.X) / Math.PI).toEqual(0.5)

        expect(Point.X.angleFrom(Point.X)).toEqual(0)
        expect(Point.Zero.angleFrom(Point.X)).toEqual(0)
        expect(Point.X.angleFrom(Point.Zero)).toEqual(0)
        const p = new Point(Math.random(), Math.random())
        expect(p.angleFrom(new Point(p.x, p.y))).toEqual(0)
        const almostP = new Point(
            p.x + Math.random() * 0.00000001,
            p.y + Math.random() * 0.00000001)
        expect(Math.sin(p.angleFrom(almostP)))
            .toBeCloseTo(0)
    })

    it('can be rotated', () => {
        points(Point.X.rotate(0.0 * Math.PI)).shouldBeCloseTo(Point.X)
        points(Point.X.rotate(0.5 * Math.PI)).shouldBeCloseTo(Point.Y)
        points(Point.X.rotate(1.0 * Math.PI)).shouldBeCloseTo(Point.Xminus)
        points(Point.X.rotate(1.5 * Math.PI)).shouldBeCloseTo(Point.Yminus)
        points(Point.X.rotate(2.0 * Math.PI)).shouldBeCloseTo(Point.X)

        points(Point.Y.rotate(0.0 * Math.PI)).shouldBeCloseTo(Point.Y)
        points(Point.Y.rotate(0.5 * Math.PI)).shouldBeCloseTo(Point.Xminus)
        points(Point.Y.rotate(1.0 * Math.PI)).shouldBeCloseTo(Point.Yminus)
        points(Point.Y.rotate(1.5 * Math.PI)).shouldBeCloseTo(Point.X)
        points(Point.Y.rotate(2.0 * Math.PI)).shouldBeCloseTo(Point.Y)
    })
})
