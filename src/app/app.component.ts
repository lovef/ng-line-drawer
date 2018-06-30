import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core'
import { Polygon } from './polygon/polygon'
import { Point } from './polygon/point'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    title = 'line-drawer'
    @ViewChild('canvas') canvas: ElementRef

    ngOnInit(): void {
        this.draw()
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.draw()
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

        let polygon = new Polygon(new Point(0, window.innerHeight), 1, 87)
        polygon = polygon.scale(Math.min(window.innerWidth, window.innerHeight) / polygon.calculateCircleRadius(7))
        let i = 0
        ctx.lineWidth = 1.3
        for (const circle of polygon.getCircleIterable()) {
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
