import { Circle, Box, Segment, Shape } from '2d-geometry'
import type { Base } from './Base'
import type { Chart } from './Chart'
import { PIXEL_RATIO } from './constants'
import { Style } from './Style'

export class Pencil {
  chart: Chart
  ctx: CanvasRenderingContext2D
  lastStyleId: number
  lastStyle: Style
  isMasking: boolean

  constructor(chart: Chart) {
    this.chart = chart
    this.ctx = chart.ctx
    this.lastStyleId = -1
    this.lastStyle = Style.EMPTY
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

  beginPath() {
    this.ctx.beginPath()
  }

  closePath() {
    this.ctx.closePath()
  }

  stroke() {
    this.ctx.stroke()
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, this.y(y))
  }

  bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, endX: number, endY: number) {
    this.ctx.bezierCurveTo(
      cp1X, this.y(cp1Y),
      cp2X, this.y(cp2Y),
      endX, this.y(endY),
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
      return this.drawShapePath(s)
    }
    if (this.lastStyle.options.fillStyle) {
      this.drawShapePath(s)
      this.ctx.fill()
    }
    if (this.lastStyle.options.strokeStyle) {
      this.drawShapePath(s)
      this.ctx.stroke()
    }
  }

  drawShapePath(s: Shape) {
    this.ctx.beginPath()
    if (s instanceof Box) {
      this.ctx.rect(s.xmin, this.y(s.ymin) - s.height, s.width, s.height)
    }
    else if (s instanceof Circle) {
      this.ctx.ellipse(s.center.x, this.y(s.center.y), s.r, s.r, 0, 0, Math.PI * 2)
    }
    else if (s instanceof Segment) {
      this.ctx.beginPath()
      this.ctx.moveTo(s.start.x, this.y(s.start.y))
      this.ctx.lineTo(s.end.x,   this.y(s.end.y))
      this.ctx.closePath()
    }
    else {
      throw new Error('unimplemented')
    }
    this.ctx.closePath()
  }
}

