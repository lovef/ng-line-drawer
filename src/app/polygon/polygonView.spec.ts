import { PolygonView, Configuration } from './polygonView'
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
        const view = new PolygonView(1000, 1000)
        const originalPolygon = view.polygon
        const originalTouchA = originalPolygon.points[3]
        const originalTouchB = originalPolygon.points[15]
        view.touch(originalTouchA, originalTouchB)
        expect(view.polygon).toEqual(originalPolygon)

        const touchA = originalTouchA.plus(new Point(Math.random(), Math.random()))
        const touchB = originalTouchB.plus(new Point(Math.random(), Math.random()))

        view.touch(touchA, touchB)
        points(touchA, touchB).shouldBeCloseTo([view.polygon.points[3], view.polygon.points[15]])
    })

    it('exposes its configuration', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const config = view.config()

        expect(config.vertices).toEqual(view.polygon.pointsCount)
        expect(config.angle).toBeCloseTo(view.polygon.startAngle * 180 / Math.PI + 360)
        expect(config.radius).toBeCloseTo(view.polygon.radius)
        expect(config.x).toBeCloseTo(100 * view.polygon.center.x / view.width)
        expect(config.y).toBeCloseTo(100 * view.polygon.center.y / view.height)
    })

    it('configuration values are rounded to ppm', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const config = view.config()
        config.radius = 0.123456789
        config.angle = 0.123456789
        config.x = 0.123456789
        config.y = 0.123456789
        view.config(config)
        view.polygon = view.polygon
        expect(view.config().radius).toEqual(0.123457)
        expect(view.config().angle).toEqual(0.123457)
        expect(view.config().x).toEqual(0.123457)
        expect(view.config().y).toEqual(0.123457)
    })

    it('entered config is returned as is', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const config = view.config()
        config.radius = 0.123456789
        config.angle = 0.123456789
        config.x = 0.123456789
        config.y = 0.123456789
        view.config(config)
        expect(view.config()).toBe(config)
        view.refreshConfig()
        expect(view.config()).not.toBe(config)
    })

    it('configuration angle is between 0 and 360 degrees', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const config = view.config()
        config.angle = 7 * 360 + 123
        view.config(config)
        view.refreshConfig()
        expect(view.config().angle).toEqual(123)
        config.angle = - 7 * 360 + 123
        view.config(config)
        view.refreshConfig()
        expect(view.config().angle).toEqual(123)
    })

    it('can be reconfigured', () => {
        const view = new PolygonView(Math.random(), Math.random())
        const original = view.polygon
        view.config(null)
        expect(view.polygon).toBe(original)
        expect(view.polygon).toEqual(original)
        const config: Configuration =  {
            vertices: 3,
            angle: Math.random(),
            radius: Math.random(),
            x: Math.random(),
            y: Math.random()
        }
        view.config(config)

        const newConfig = view.config()
        expect(newConfig.vertices).toEqual(config.vertices)
        expect(newConfig.angle).toBeCloseTo(config.angle)
        expect(newConfig.radius).toBeCloseTo(config.radius)
        expect(newConfig.x).toBeCloseTo(config.x)
        expect(newConfig.y).toBeCloseTo(config.y)
    })

    it('image does not jump when removing or adding a finger', () => {
        const view = new PolygonView(1, 1)
        const original = view.polygon
        view.touch(new Point(-1, 0), new Point(1, 0))
        view.touch(new Point(-1, 0))
        expect(view.polygon.center).toEqual(original.center)
        expect(view.polygon.startAngle).toEqual(original.startAngle)
        view.touch(new Point(-1, 0), new Point(1, 0))
        view.touch(new Point(1, 0))
        expect(view.polygon.center).toEqual(original.center)
        expect(view.polygon.startAngle).toEqual(original.startAngle)
        view.touch(new Point(1, 0), new Point(-1, 0))
        expect(view.polygon.center).toEqual(original.center)
        expect(view.polygon.startAngle).toEqual(original.startAngle)
    })
})
