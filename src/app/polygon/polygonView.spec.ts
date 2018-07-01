import { PolygonView } from './polygonView'
import { Point } from './point'

function radiusToMaxSideRatio(view: PolygonView): number {
    return view.polygon.radius / Math.max(view.width, view.height)
}

describe('Polygon', () => {

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
})
