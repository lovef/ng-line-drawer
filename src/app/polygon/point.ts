export class Point {
    static readonly Zero = new Point(0, 0)
    static readonly X = new Point(1, 0)
    static readonly Y = new Point(0, 1)
    static readonly Xminus = new Point(-1, 0)
    static readonly Yminus = new Point(0, -1)

    static random(): Point {
        return new Point(Math.floor(Math.random()), Math.floor(Math.random()))
    }
    constructor(readonly x: number, readonly y: number) { }

    plus(point: Point): Point {
        return new Point(this.x + point.x, this.y + point.y)
    }

    minus(point: Point): Point {
        return new Point(this.x - point.x, this.y - point.y)
    }

    multiply(multiplier: number): Point {
        return new Point(this.x * multiplier, this.y * multiplier)
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    toString() {
        return '(' + Math.round(this.x * 100) / 100 + ', ' + Math.round(this.y * 100) / 100 + ')'
    }
}
