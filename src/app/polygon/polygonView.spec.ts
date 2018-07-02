import { PolygonView } from './polygonView'
import { Point } from './point'

function radiusToMaxSideRatio(view: PolygonView): number {
    return view.polygon.radius / Math.max(view.width, view.height)
}

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

    shouldBeCloseTo(actualPoints: Point[]) {
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

describe('PolygonView', () => {

    it('can is initialized with center in botom left corner', () => {
        const view = new PolygonView(Math.random(), Math.random())
        expect(view.polygon.center.x).toEqual(view.width / 2)
        expect(view.polygon.center.y).toEqual(view.height)
        expect(view.polygon.calculateCircleRadius(7)).toBeCloseTo(view.height)
    })

    it('can be rezised', () => {
        const view = new PolygonView(1, 1)
        view.resize(Math.random(), Math.random())
        expect(view.width).toBeLessThan(1)
        expect(view.height).toBeLessThan(1)
    })

    it('adjusts polygon on resize', () => {
        const view = new PolygonView(Math.random(), Math.random())
        view.move(new Point(Math.random(), Math.random()))
        const original = view.relativePosition()
        view.resize(Math.random(), Math.random())
        const updated = view.relativePosition()
        expect(updated.x).toBeCloseTo(original.x)
        expect(updated.y).toBeCloseTo(original.y)
    })

    it('adjust polygon scale on resize', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const originalRatio = radiusToMaxSideRatio(view)
        view.resize(Math.random(), Math.random())
        expect(originalRatio).toBeCloseTo(radiusToMaxSideRatio(view))
    })

    it('can be moved', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const originalPosition = view.polygon.center
        const move = new Point(Math.random(), Math.random())
        view.move(move)
        const expectedPosition = originalPosition.plus(move)
        expect(view.polygon.center.x).toBeCloseTo(expectedPosition.x)
        expect(view.polygon.center.y).toBeCloseTo(expectedPosition.y)
    })

    it('can be panned with touch one finger touch', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const originalPolygon = view.polygon
        const originalTouch = new Point(Math.random(), Math.random())
        view.touch(originalTouch)
        expect(view.polygon).toEqual(originalPolygon)

        const move = new Point(Math.random(), Math.random())
        view.touch(originalTouch.plus(move))
        const actualtMove = view.polygon.center.minus(originalPolygon.center)
        point(actualtMove).shouldBeCloseTo(move)
        expect(actualtMove.x).toBeCloseTo(move.x)
        expect(actualtMove.y).toBeCloseTo(move.y)
    })

    it('can be panned, rotated and scrolled with two finger touch', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const originalPolygon = view.polygon
        const originalTouchA = originalPolygon.points[3]
        const originalTouchB = originalPolygon.points[15]
        view.touch(originalTouchA, originalTouchB)
        expect(view.polygon).toEqual(originalPolygon)

        const touchA = new Point(Math.random(), Math.random())
        const touchB = new Point(Math.random(), Math.random())

        view.touch(touchA, touchB)
        points(touchA, touchB).shouldBeCloseTo([view.polygon.points[3], view.polygon.points[15]])
    })
})
