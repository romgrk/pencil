import { Arc, Circle, Bezier, Quadratic, Box, Path, Point, Polygon, Segment, Shape, ShapeTag } from '2d-geometry'
import type { Container } from './Container'
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

  constructor(graph: Graph) {
    this.graph = graph
    this.ctx = graph.ctx
    this.lastStyleId = -1
    this.lastStyle = Style.EMPTY
    this.lastTextStyleId = -1
    this.lastTextStyle = TextStyle.EMPTY
  }

  setup() {
    this.ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0)
    this.ctx.clearRect(0, 0, this.graph.width, this.graph.height)
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
    s.stroke(this.ctx)
    s.fill(this.ctx)
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

  prepare(container: Container) {
    this.save()

    if (container.hasTransform()) {
      const t = container.transform
      this.ctx.transform(t.a, t.b, t.c, t.d, t.tx, t.ty)
    }

    if (container.mask) {
      this.mask(container.mask)
    }

    if (container.alpha !== 1) {
      this.ctx.globalAlpha = this.ctx.globalAlpha * container.alpha
    }
  }

  mask(mask: Shape) {
    this.ctx.clip(this.trace(mask))
  }

  draw(s: Shape) {
    const path = this.trace(s)
    if (this.lastStyle.options.fill) {
      this.ctx.fill(path, 'evenodd')
    }
    if (this.lastStyle.options.stroke) {
      this.trace(s)
      this.ctx.stroke(path)
    }
  }

  trace(shape: Shape): Path2D {
    if (shape._data) {
      return shape._data as Path2D
    }
    const p = new Path2D()
    switch (shape.tag) {
      case ShapeTag.Box: {
        const s = shape as Box
        p.rect(s.xmin, s.ymin - s.height, s.width, s.height)
        break
      }
      case ShapeTag.Circle: {
        const s = shape as Circle
        p.ellipse(s.center.x, s.center.y, s.r, s.r, 0, 0, Math.PI * 2)
        break
      }

      case ShapeTag.Segment: {
        const s = shape as Segment
        p.moveTo(s.start.x, s.start.y)
        p.lineTo(s.end.x,   s.end.y)
        break
      }
      case ShapeTag.Arc: {
        const s = shape as Arc
        p.ellipse(s.pc.x, s.pc.y, s.r, s.r, 0, s.startAngle, s.endAngle, !s.clockwise)
        break
      }
      case ShapeTag.Quadratic: {
        const s = shape as Quadratic
        p.moveTo(s.start.x, s.start.y)
        p.quadraticCurveTo(s.control1.x, s.control1.y, s.end.x, s.end.y)
        break
      }
      case ShapeTag.Bezier: {
        const s = shape as Bezier
        p.moveTo(s.start.x, s.start.y)
        p.bezierCurveTo(s.control1.x, s.control1.y, s.control2.x, s.control2.y, s.end.x, s.end.y)
        break
      }

      case ShapeTag.Path: {
        const s = shape as Path
        drawPath(p, s)
        break
      }

      case ShapeTag.Polygon: {
        const s = shape as Polygon
        drawPath(p, s)
        break
      }

      default: {
        throw new Error('unimplemented')
      }
    }
    shape._data = p
    return p
  }

  drawText(value: string, position: Point) {
    if (this.lastStyle.options.fill) {
      this.ctx.fillText(value, position.x, position.y)
    }
    if (this.lastStyle.options.stroke) {
      this.ctx.strokeText(value, position.x, position.y)
    }
  }
}

function drawPath(p: Path2D, shape: Polygon | Path) {
  const parts = shape.parts

  if (parts.length === 0) {
    return
  }

  const start = parts[0].start
  p.moveTo(start.x, start.y)

  let lastPoint = null
  for (let i = 0; i < parts.length; i++) {
    const shape = parts[i]
    const start = shape.start

    if (start !== lastPoint && lastPoint !== null && !start.equalTo(lastPoint)) {
      p.closePath()
      p.moveTo(start.x, start.y)
    }

    lastPoint = shape.end

    switch (shape.tag) {
      case ShapeTag.Segment: {
        const s = shape as Segment
        p.lineTo(s.end.x,   s.end.y)
        break
      }
      case ShapeTag.Arc: {
        const s = shape as Arc
        p.ellipse(s.pc.x, s.pc.y, s.r, s.r, 0, s.startAngle, s.endAngle, !s.clockwise)
        break
      }
      case ShapeTag.Quadratic: {
        const s = shape as Quadratic
        p.quadraticCurveTo(s.control1.x, s.control1.y, s.end.x, s.end.y)
        break
      }
      case ShapeTag.Bezier: {
        const s = shape as Bezier
        p.bezierCurveTo(s.control1.x, s.control1.y, s.control2.x, s.control2.y, s.end.x, s.end.y)
        break
      }
      default: {
        throw new Error('unimplemented')
      }
    }
  }
  if (shape instanceof Polygon) {
    p.closePath()
  }
}
