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

    angle(): number {
        return this.angleFrom(Point.X)
    }

    angleFrom(other: Point): number {
        const a = this.unit()
        const b = other.unit()
        return this.crossProduct(other) <= 0 ?
            Math.acos(a.dotProduct(b)) :
            2 * Math.PI - Math.acos(a.dotProduct(b))
    }

    private dotProduct(other: Point): number { return this.x * other.x + this.y * other.y }
    private crossProduct(other: Point): number { return this.x * other.y - this.y * other.x }
    private unit() { return this.multiply(1 / this.length()) }

    toString() {
        return '(' + Math.round(this.x * 100) / 100 + ', ' + Math.round(this.y * 100) / 100 + ')'
    }
}
