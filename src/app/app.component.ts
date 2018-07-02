import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core'
import { Point } from './polygon/point'
import { PolygonView } from './polygon/polygonView'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    polygonView: PolygonView
    lastMousePosition: Point
    mouseDown = false

    title = 'line-drawer'
    @ViewChild('canvas') canvas: ElementRef

    ngOnInit(): void {
        this.polygonView = new PolygonView(window.innerWidth, window.innerHeight)
        this.draw()
    }

    // @HostListener('canvas:touch:gesture', ['$event'])
    onGesture(event) {
        console.log(event)
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        console.log('resize', event)
        this.polygonView.resize(window.innerWidth, window.innerHeight)
        this.draw()
    }

    @HostListener('mousewheel', ['$event'])
    onMouseWheel(event: WheelEvent) {
        console.log('mousewheel', event)
        if (event.shiftKey) {
            if (event.wheelDeltaY > 0) {
                this.polygonView.rotate(Math.PI / 180)
            } else if (event.wheelDeltaY < 0) {
                this.polygonView.rotate(-Math.PI / 180)
            }
        } else {
            if (event.wheelDeltaY > 0) {
                this.polygonView.scale(new Point(event.x, event.y), 1.1)
            } else if (event.wheelDeltaY < 0) {
                this.polygonView.scale(new Point(event.x, event.y), 1 / 1.1)
            }
        }
        this.draw()
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        console.log('mousedown', event)
        this.lastMousePosition = new Point(event.x, event.y)
        this.mouseDown = true
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        console.log('mouseup', event)
        this.mouseDown = false
    }

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        console.log('mousemove', event)
        if (this.mouseDown) {
            const position = new Point(event.x, event.y)
            if (event.shiftKey) {
                this.polygonView.rotateBetween(this.lastMousePosition, position)
            } else {
                this.polygonView.move(position.minus(this.lastMousePosition))
            }
            this.lastMousePosition = position
            this.draw()
        }
    }
// https://stackoverflow.com/questions/14928485/how-to-handle-multiple-touch-events-on-a-single-html-element-using-angular-direc
    @HostListener('touchmove', ['$event'])
    onTouchmove(event) {
        console.log('touchmove', event)
    }

    draw() {
        const ctx: CanvasRenderingContext2D =
            this.canvas.nativeElement.getContext('2d')

        ctx.canvas.width = window.innerWidth
        ctx.canvas.height = window.innerHeight

        ctx.strokeStyle = '#FFF'
        const colors = [
            '#FF0000',
            '#FF8000',
            '#FFFF00',
            '#008000',
            '#0000FF',
            '#A000C0'
        ].reverse()

        let i = 0
        ctx.lineWidth = 1.3
        for (const circle of this.polygonView.polygon.getCircleIterable()) {
            ctx.strokeStyle = colors[i++]
            for (const line of circle) {
                ctx.beginPath()
                ctx.moveTo(line.start.x, line.start.y)
                ctx.lineTo(line.end.x, line.end.y)
                ctx.stroke()
            }
            if (i >= colors.length) {
                break
            }
        }
    }
}
