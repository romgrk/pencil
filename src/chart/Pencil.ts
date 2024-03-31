import { Circle, Bezier, Box, Path, Point, Segment, Shape } from '2d-geometry'
import type { Base } from './Base'
import type { Chart } from './Chart'
import { PIXEL_RATIO } from './constants'
import { Style } from './Style'
import { TextStyle } from './TextStyle'

export class Pencil {
  chart: Chart
  ctx: CanvasRenderingContext2D
  lastStyleId: number
  lastStyle: Style
  lastTextStyleId: number
  lastTextStyle: TextStyle
  isMasking: boolean

  constructor(chart: Chart) {
    this.chart = chart
    this.ctx = chart.ctx
    this.lastStyleId = -1
    this.lastStyle = Style.EMPTY
    this.lastTextStyleId = -1
    this.lastTextStyle = TextStyle.EMPTY
    this.isMasking = false
  }

  y(n: number) { return this.chart.height - n }

  style(s: Style) {
    if (this.lastStyleId === s.id) {
      return
    }
    this.lastStyleId = s.id
    this.lastStyle = s
    this.ctx.lineWidth = s.options.lineWidth
    this.ctx.strokeStyle = s.options.strokeStyle ?? 'black'
    this.ctx.fillStyle = s.options.fillStyle ?? 'black'
  }

  textStyle(s: TextStyle) {
    // FIXME: This logic is not working
    // if (this.lastTextStyleId === s.id) {
    //   return
    // }
    // this.lastTextStyleId = s.id
    this.lastTextStyle = s
    this.ctx.font = s.options.font
    this.ctx.textAlign = s.options.textAlign
    this.ctx.textBaseline = s.options.textBaseline
  }

  clear() {
    this.ctx.resetTransform()
    this.ctx.clearRect(0, 0, this.chart.width * PIXEL_RATIO, this.chart.height * PIXEL_RATIO)
    this.ctx.setTransform(
      this.chart.transform.a,
      this.chart.transform.b,
      this.chart.transform.c,
      this.chart.transform.d,
      this.chart.transform.tx,
      -this.chart.transform.ty,
    )
  }

  mask(mask: Base) {
    this.isMasking = true
    mask.render()
    this.isMasking = false
    this.ctx.clip()
  }

  drawShape(s: Shape) {
    if (this.isMasking) {
      this.ctx.beginPath()
      this.drawShapePath(s)
      this.ctx.closePath()
      return 
    }
    if (this.lastStyle.options.fillStyle) {
      this.ctx.beginPath()
      this.drawShapePath(s)
      this.ctx.fill()
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.beginPath()
      this.drawShapePath(s)
      this.ctx.stroke()
    }
  }

  drawShapePath(s: Shape) {
    if (s instanceof Box) {
      this.ctx.rect(s.xmin, this.y(s.ymin) - s.height, s.width, s.height)
    }
    else if (s instanceof Segment) {
      this.ctx.moveTo(s.start.x, this.y(s.start.y))
      this.ctx.lineTo(s.end.x,   this.y(s.end.y))
    }
    else if (s instanceof Circle) {
      this.ctx.ellipse(s.center.x, this.y(s.center.y), s.r, s.r, 0, 0, Math.PI * 2)
    }
    else if (s instanceof Bezier) {
      this.ctx.moveTo(s.start.x, this.y(s.start.y))
      this.ctx.bezierCurveTo(
        s.control1.x, this.y(s.control1.y),
        s.control2.x, this.y(s.control2.y),
        s.end.x, this.y(s.end.y),
      )
    }
    else if (s instanceof Path) {
      for (let i = 0; i < s.parts.length; i++) {
        this.drawShapePath(s.parts[i])
      }
    }
    else {
      throw new Error('unimplemented')
    }
  }

  drawPoint(s: Point, r: number = 3) {
    if (this.isMasking) {
      this.ctx.beginPath()
      return this.drawShapePath(s)
    }
    if (this.lastStyle.options.fillStyle) {
      this.ctx.beginPath()
      this.ctx.ellipse(s.x, this.y(s.y), r, r, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.beginPath()
      this.ctx.ellipse(s.x, this.y(s.y), r, r, 0, 0, Math.PI * 2)
      this.ctx.stroke()
    }
  }

  drawText(value: string, position: Point) {
    if (this.lastStyle.options.fillStyle) {
      this.ctx.fillText(value, position.x, this.y(position.y))
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.strokeText(value, position.x, this.y(position.y))
    }
  }

}

