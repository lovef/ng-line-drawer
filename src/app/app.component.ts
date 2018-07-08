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
    configFocused = false

    title = 'line-drawer'

    get configuration() {
        return JSON.stringify(this.polygonView.config(), null, 2)
    }

    set configuration(input) {
        try {
            this.polygonView.config(JSON.parse(input))
            this.config.nativeElement.value = this.configuration
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
        event.preventDefault()
        this.polygonView.stopTouch()
        if (event.touches.length === 0) {
            this.hideOverlayCountdown()
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.polygonView.resize(window.innerWidth, window.innerHeight)
        this.update()
    }

    onMouseWheel(event: WheelEvent) {
        console.log(event)
        event.preventDefault()
        if (this.configFocused) {
            this.onConfigMouseWheel(event)
            return
        }

        this.showOverlay()
        if (event.shiftKey) {
            if (event.deltaY < 0) {
                this.polygonView.rotate(Math.PI / 180)
            } else if (event.deltaY > 0) {
                this.polygonView.rotate(-Math.PI / 180)
            }
        } else {
            if (event.deltaY < 0) {
                this.polygonView.scale(new Point(event.x, event.y), 1.1)
            } else if (event.deltaY > 0) {
                this.polygonView.scale(new Point(event.x, event.y), 1 / 1.1)
            }
        }
        this.hideOverlayCountdown()
        this.update()
    }

    onConfigMouseWheel(event) {
        event.preventDefault()
        this.showOverlay()

        try {
            const textArea: HTMLTextAreaElement = this.config.nativeElement
            const json = textArea.value
            const result = this.polygonView.manipulateJson(json, textArea.selectionStart, -event.deltaY)
            this.configuration = result.config
            textArea.selectionStart = result.selectionStart
            textArea.selectionEnd = result.selectionEnd

            this.update()
        } catch (e) { }
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

    focusConfig(event) {
        this.configFocused = true
        this.showOverlay()
    }

    blurConfig() {
        this.configFocused = false
        this.hideOverlayCountdown()
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

        for (const circle of this.polygonView.getCircleViewIterable()) {
            ctx.strokeStyle = circle.color
            for (const line of circle.circle) {
                ctx.beginPath()
                ctx.moveTo(line.start.x, line.start.y)
                ctx.lineTo(line.end.x, line.end.y)
                ctx.stroke()
            }
        }
    }
}
