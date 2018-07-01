import { Point } from './point'

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
    })
})
