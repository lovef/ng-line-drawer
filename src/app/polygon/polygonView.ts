import { Polygon } from './polygon'
import { Point } from './point'

export class PolygonView {

    width: number
    height: number

    polygon: Polygon

    private oldPositionA: Point
    private oldPositionB: Point

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.polygon = new Polygon(new Point(width / 2, height), 1, 87)
        this.polygon = this.polygon.changeRadiusTo(height / this.polygon.calculateCircleRadius(7))
    }

    relativePosition(): Point {
        return new Point(this.polygon.center.x / this.width, this.polygon.center.y / this.height)
    }

    resize(width, height) {
        const originalRelativePosition = this.relativePosition()
        const oldMaxSize = Math.max(this.width, this.height)
        this.width = width
        this.height = height
        this.polygon = this.polygon
            .moveTo(new Point(width * originalRelativePosition.x, height * originalRelativePosition.y))
            .changeRadiusTo(this.polygon.radius * Math.max(width, height) / oldMaxSize)
    }

    scale(position: Point, scale: number) {
        this.polygon = this.polygon.scale(position, scale)
    }

    move(delta: Point) {
        this.polygon = this.polygon.move(delta)
    }

    rotate(delta: number) {
        this.polygon = this.polygon.rotate(delta)
    }

    rotateBetween(from: Point, to: Point) {
        const a = from.minus(this.polygon.center)
        const b = to.minus(this.polygon.center)
        this.polygon = this.polygon.rotate(b.angleFrom(a))
    }

    touch(positionA: Point, positionB: Point = null) {
        if (positionA && this.oldPositionA && positionB && this.oldPositionB) {
            this.moveWithTouch(
                this.oldPositionA, positionA,
                this.oldPositionB, positionB)

        } else if (positionA && this.oldPositionA) {
            const move = positionA.minus(this.oldPositionA)
            this.polygon = this.polygon.move(move)
        }

        this.oldPositionA = positionA
        this.oldPositionB = positionB
    }

    stopTouch() {
        this.oldPositionA = null
        this.oldPositionB = null
    }

    private moveWithTouch(
        A0: Point, A: Point,
        B0: Point, B: Point
    ) {
        const C0 = this.polygon.center
        const AB = B.minus(A)
        const A0B0 = B0.minus(A0)
        const angle = AB.angleFrom(A0B0)
        const scale = AB.length() / A0B0.length()
        const C = C0.minus(A0).rotate(angle).multiply(scale).plus(A)
        this.polygon = new Polygon(C,
            this.polygon.radius * scale,
            this.polygon.pointsCount,
            this.polygon.startAngle + angle)
    }
}
