import { Point } from './point'

describe('Point', () => {
    it('(a, b) + (c, d) = (a + c, b + d)', () => {
        expect(new Point(1, 2).plus(new Point(3, 4))).toEqual(new Point(4, 6))
    })

    it('(a, b) * x = (a * x, b * x)', () => {
        expect(new Point(1, 2).multiply(3)).toEqual(new Point(3, 6))
    })
})
