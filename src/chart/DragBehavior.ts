import { Point } from '2d-geometry'
import type { Chart } from './Chart'

export type DragOptions = {
  onStart?: (start: Point) => void,
  onMove?: (current: Point, dx: number, dy: number) => void,
  onEnd?: (end: Point) => void,
}

export class DragBehavior {
  chart: Chart
  start: Point
  previous: Point
  options: DragOptions

  constructor(chart: Chart, options: DragOptions) {
    this.chart = chart
    this.start = Point.EMPTY
    this.previous = Point.EMPTY
    this.options = options
  }

  enable() {
    this.chart.canvas.addEventListener('pointerdown', this.onDragStart)
    this.chart.canvas.addEventListener('touchstart',  this.onDragStart)
  }

  disable() {
    this.chart.canvas.removeEventListener('pointerdown', this.onDragStart)
    this.chart.canvas.removeEventListener('touchstart',  this.onDragStart)
  }

  onDragStart = (event: PointerEvent | TouchEvent) => {
    // Cancel the touchstart that comes after pointerdown
    event.preventDefault()
    if (this.start !== Point.EMPTY) {
      return
    }
    this.start = new Point(pointerX(event), pointerY(event))
    this.previous = this.start
    document.addEventListener('pointermove', this.onDragMove)
    document.addEventListener('touchmove',   this.onDragMove)
    document.addEventListener('pointerup',   this.onDragEnd)
    document.addEventListener('touchend',    this.onDragEnd)
    this.options.onStart?.(this.start)
  }

  onDragMove = (event: PointerEvent | TouchEvent) => {
    const current = new Point(pointerX(event), pointerY(event))

    const dx = current.x - this.previous.x
    const dy = current.y - this.previous.y

    this.options.onMove?.(current, dx, dy)

    this.previous = current
  }

  onDragEnd = (event: PointerEvent | TouchEvent) => {
    const end = new Point(pointerX(event), pointerY(event))
    document.removeEventListener('pointermove', this.onDragMove)
    document.removeEventListener('touchmove',   this.onDragMove)
    document.removeEventListener('pointerup',   this.onDragEnd)
    document.removeEventListener('touchend',    this.onDragEnd)
    this.options.onEnd?.(end)
    this.start = Point.EMPTY
    this.previous = Point.EMPTY
  }
}

function pointerX(event: PointerEvent | TouchEvent) {
  if (event instanceof PointerEvent) {
    return event.pageX
  } else {
    return (event.changedTouches[0] ?? event.touches[0]).pageX
  }
}

function pointerY(event: PointerEvent | TouchEvent) {
  if (event instanceof PointerEvent) {
    return event.pageY
  } else {
    return (event.changedTouches[0] ?? event.touches[0]).pageY
  }
}
