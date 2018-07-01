import { Polygon } from './polygon'
import { Point } from './point'

export class PolygonView {

    width: number
    height: number

    polygon: Polygon

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
        this.polygon = this.polygon.moveTo(this.polygon.center.plus(delta))
    }

    rotate(delta: number) {
        this.polygon = this.polygon.rotate(delta)
    }

    rotateBetween(from: Point, to: Point) {
        const a = from.minus(this.polygon.center)
        const b = to.minus(this.polygon.center)
        this.polygon = this.polygon.rotate(b.angleFrom(a))
    }
}
