import { Circle, Bezier, Box, Path, Point, Segment, Shape, ShapeTag } from '2d-geometry'
import type { Base } from './Base'
import type { Graph } from './Graph'
import { PIXEL_RATIO } from './constants'
import { Style } from './Style'
import { TextStyle } from './TextStyle'

export class Pencil {
  graph: Graph
  ctx: CanvasRenderingContext2D
  lastStyleId: number
  lastStyle: Style
  lastTextStyleId: number
  lastTextStyle: TextStyle
  isMasking: boolean

  constructor(graph: Graph) {
    this.graph = graph
    this.ctx = graph.ctx
    this.lastStyleId = -1
    this.lastStyle = Style.EMPTY
    this.lastTextStyleId = -1
    this.lastTextStyle = TextStyle.EMPTY
    this.isMasking = false
  }

  save() {
    this.ctx.save()
  }

  restore() {
    this.ctx.restore()
    this.lastStyleId = -1
    this.lastTextStyleId = -1
  }


  style(s: Style) {
    if (this.lastStyleId === s.id) {
      return
    }
    this.lastStyleId = s.id
    this.lastStyle = s
    this.ctx.lineWidth = s.options.lineWidth
    s.strokeStyle(this.ctx)
    s.fillStyle(this.ctx)
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

  setup() {
    this.ctx.resetTransform()
    this.ctx.clearRect(0, 0, this.graph.width * PIXEL_RATIO, this.graph.height * PIXEL_RATIO)
    this.ctx.setTransform(
      this.graph.transform.a,
      this.graph.transform.b,
      this.graph.transform.c,
      this.graph.transform.d,
      this.graph.transform.tx,
      -this.graph.transform.ty,
    )
  }

  mask(mask: Base) {
    this.isMasking = true
    mask.render(this.graph)
    this.isMasking = false
    this.ctx.clip()
  }

  draw(s: Shape) {
    if (this.isMasking) {
      this.ctx.beginPath()
      this.drawPath(s)
      this.ctx.closePath()
      return
    }
    if (this.lastStyle.options.fillStyle) {
      this.ctx.beginPath()
      this.drawPath(s)
      this.ctx.fill()
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.beginPath()
      this.drawPath(s)
      this.ctx.stroke()
    }
  }

  drawPath(shape: Shape, move: boolean = true) {
    switch (shape.tag) {
      case ShapeTag.Box: {
        const s = shape as Box
        this.ctx.rect(s.xmin, s.ymin - s.height, s.width, s.height)
        break
      }
      case ShapeTag.Segment: {
        const s = shape as Segment
        if (move)
          this.ctx.moveTo(s.start.x, s.start.y)
        this.ctx.lineTo(s.end.x,   s.end.y)
        break
      }
      case ShapeTag.Circle: {
        const s = shape as Circle
        this.ctx.ellipse(s.center.x, s.center.y, s.r, s.r, 0, 0, Math.PI * 2)
        break
      }
      case ShapeTag.Bezier: {
        const s = shape as Bezier
        if (move)
          this.ctx.moveTo(s.start.x, s.start.y)
        this.ctx.bezierCurveTo(
          s.control1.x, s.control1.y,
          s.control2.x, s.control2.y,
          s.end.x, s.end.y,
        )
        break
      }
      case ShapeTag.Path: {
        const s = shape as Path
        const start = s.pointAtLength(0)
        this.ctx.moveTo(start.x, start.y)

        for (let i = 0; i < s.parts.length; i++) {
          this.drawPath(s.parts[i], false)
        }
        break
      }
      default: {
        throw new Error('unimplemented')
      }
    }
  }

  drawPoint(s: Point, r: number = 3) {
    if (this.isMasking) {
      this.ctx.beginPath()
      return this.drawPath(s)
    }
    if (this.lastStyle.options.fillStyle) {
      this.ctx.beginPath()
      this.ctx.ellipse(s.x, s.y, r, r, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.beginPath()
      this.ctx.ellipse(s.x, s.y, r, r, 0, 0, Math.PI * 2)
      this.ctx.stroke()
    }
  }

  drawText(value: string, position: Point) {
    if (this.lastStyle.options.fillStyle) {
      this.ctx.fillText(value, position.x, position.y)
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.strokeText(value, position.x, position.y)
    }
  }
}
