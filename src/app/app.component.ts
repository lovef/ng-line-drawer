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
    timeout

    title = 'line-drawer'

    get configuration() {
        return JSON.stringify(this.polygonView.config(), null, 2)
    }

    set configuration(input) {
        try {
            this.polygonView.config(JSON.parse(input))
            this.draw()
        } catch (e) { }
    }

    @ViewChild('canvas') canvas: ElementRef
    @ViewChild('overlay') overlay: ElementRef
    @ViewChild('config') config: ElementRef

    ngOnInit(): void {
        this.polygonView = new PolygonView(window.innerWidth, window.innerHeight)
        this.update()
    }

    onTouchstart(event) {
        event.preventDefault()
        this.showOverlay()
        this.canvas.nativeElement.focus()
        this.polygonView.touch(new Point(event.touches[0].pageX, event.touches[0].pageY),
            event.touches[1] ? new Point(event.touches[1].pageX, event.touches[1].pageY) : null)
    }

    onTouchmove(event) {
        event.preventDefault()
        this.polygonView.touch(new Point(event.touches[0].pageX, event.touches[0].pageY),
            event.touches[1] ? new Point(event.touches[1].pageX, event.touches[1].pageY) : null)
        this.update()
    }

    onTouchcancel(event) {
        if (event.touches.length > 0) {
            return
        }
        event.preventDefault()
        this.polygonView.stopTouch()
        this.hideOverlayCountdown()
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.polygonView.resize(window.innerWidth, window.innerHeight)
        this.update()
    }

    onMouseWheel(event: WheelEvent) {
        event.preventDefault()
        this.showOverlay()
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
        this.hideOverlayCountdown()
        this.update()
    }

    onMouseDown(event: MouseEvent) {
        this.lastMousePosition = new Point(event.x, event.y)
        this.mouseDown = true
        this.showOverlay()
    }

    onMouseUp(event: MouseEvent) {
        this.mouseDown = false
        this.hideOverlayCountdown()
    }

    onMousemove(event: MouseEvent) {
        if (event.buttons) {
            const position = new Point(event.x, event.y)
            if (event.shiftKey) {
                this.polygonView.rotateBetween(this.lastMousePosition, position)
            } else {
                this.polygonView.move(position.minus(this.lastMousePosition))
            }
            this.lastMousePosition = position
            this.update()
        }
    }

    showOverlay() {
        clearTimeout(this.timeout)
        this.overlay.nativeElement.style.display = 'block'
    }

    hideOverlayCountdown() {
        this.polygonView.refreshConfig()
        this.timeout = setTimeout(() => {
            this.overlay.nativeElement.style.display = 'none'
        }, 2000)
    }

    update() {
        this.draw()
        this.configuration = JSON.stringify(this.polygonView.config(), null, 2)
        this.config.nativeElement.rows = this.configuration.split(/\r\n|\r|\n/).length
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
