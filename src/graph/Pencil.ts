import { Arc, Circle, Bezier, Quadratic, Box, Path, Point, Segment, Shape, ShapeTag } from '2d-geometry'
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

  prepare(container: Container) {
    this.save()

    if (!container.transform.isIdentity()) {
      this.ctx.transform(
        container.transform.a,
        container.transform.b,
        container.transform.c,
        container.transform.d,
        container.transform.tx,
        container.transform.ty,
      )
    }

    if (container.mask) {
      this.mask(container.mask)
    }

    if (container.alpha !== 1) {
      this.ctx.globalAlpha = this.ctx.globalAlpha * container.alpha
    }
  }

  mask(mask: Container) {
    this.isMasking = true
    mask.render(this.graph)
    this.isMasking = false
    this.ctx.clip()
  }

  draw(s: Shape) {
    if (this.isMasking) {
      this.ctx.beginPath()
      this.trace(s)
      this.ctx.closePath()
      return
    }
    if (this.lastStyle.options.fillStyle) {
      this.ctx.beginPath()
      this.trace(s)
      this.ctx.fill('evenodd')
    }
    if (this.lastStyle.options.strokeStyle) {
      this.ctx.beginPath()
      this.trace(s)
      this.ctx.stroke()
    }
  }

  trace(shape: Shape) {
    switch (shape.tag) {
      case ShapeTag.Box: {
        const s = shape as Box
        this.ctx.rect(s.xmin, s.ymin - s.height, s.width, s.height)
        break
      }
      case ShapeTag.Circle: {
        const s = shape as Circle
        this.ctx.ellipse(s.center.x, s.center.y, s.r, s.r, 0, 0, Math.PI * 2)
        break
      }

      case ShapeTag.Segment: {
        const s = shape as Segment
        this.ctx.moveTo(s.start.x, s.start.y)
        this.ctx.lineTo(s.end.x,   s.end.y)
        break
      }
      case ShapeTag.Arc: {
        const s = shape as Arc
        this.ctx.ellipse(s.pc.x, s.pc.y, s.r, s.r, 0, s.startAngle, s.endAngle, s.counterClockwise)
        break
      }
      case ShapeTag.Quadratic: {
        const s = shape as Quadratic
        this.ctx.moveTo(s.start.x, s.start.y)
        this.ctx.quadraticCurveTo(s.control1.x, s.control1.y, s.end.x, s.end.y)
        break
      }
      case ShapeTag.Bezier: {
        const s = shape as Bezier
        this.ctx.moveTo(s.start.x, s.start.y)
        this.ctx.bezierCurveTo(s.control1.x, s.control1.y, s.control2.x, s.control2.y, s.end.x, s.end.y)
        break
      }

      case ShapeTag.Path: {
        const s = shape as Path
        drawPath(this.ctx, s)
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
      return this.trace(s)
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

export function getNeedsContext(container: Container) {
  return !container.transform.isIdentity() || container.alpha !== 1 || container.mask !== null
}

function drawPath(ctx: CanvasRenderingContext2D, path: Path) {
  const start = path.pointAtLength(0)
  ctx.moveTo(start.x, start.y)

  let lastPoint = null
  for (let i = 0; i < path.parts.length; i++) {
    const shape = path.parts[i]
    const start = shape.start

    if (start !== lastPoint) {
      ctx.closePath()
      ctx.moveTo(start.x, start.y)
    }

    lastPoint = shape.end

    switch (shape.tag) {
      case ShapeTag.Segment: {
        const s = shape as Segment
        ctx.lineTo(s.end.x,   s.end.y)
        break
      }
      case ShapeTag.Arc: {
        const s = shape as Arc
        ctx.ellipse(s.pc.x, s.pc.y, s.r, s.r, 0, s.startAngle, s.endAngle, s.counterClockwise)
        break
      }
      case ShapeTag.Quadratic: {
        const s = shape as Quadratic
        ctx.quadraticCurveTo(s.control1.x, s.control1.y, s.end.x, s.end.y)
        break
      }
      case ShapeTag.Bezier: {
        const s = shape as Bezier
        ctx.bezierCurveTo(s.control1.x, s.control1.y, s.control2.x, s.control2.y, s.end.x, s.end.y)
        break
      }
      default: {
        throw new Error('unimplemented')
      }
    }
  }
}
