import type { Graph } from './Graph'

export type ScrollOptions = {
  onScrollHorizontal?: (event: WheelEvent) => void,
  onScrollVertical?: (event: WheelEvent) => void,
}

export class ScrollBehavior {
  graph: Graph
  options: ScrollOptions

  constructor(graph: Graph, options: ScrollOptions) {
    this.graph = graph
    this.options = options
  }

  enable() {
    this.graph.canvas.addEventListener('wheel', this.onWheel)
  }

  disable() {
    this.graph.canvas.removeEventListener('wheel', this.onWheel)
  }

  onWheel = (event: WheelEvent) => {
    const dx = event.deltaX
    const dy = event.deltaY
    const isHorizontal = Math.abs(dx) > Math.abs(dy)

    if (isHorizontal) {
      this.options.onScrollHorizontal?.(event)
    } else {
      this.options.onScrollVertical?.(event)
    }
  }
}
