import { Point } from '2d-geometry'
import type { Graph } from './Graph'

export type HoverOptions = {
  onPointerMove?: (position: Point, event: PointerEvent) => void,
}

export class HoverBehavior {
  graph: Graph
  options: HoverOptions

  constructor(graph: Graph, options: HoverOptions) {
    this.graph = graph
    this.options = options
  }

  enable() {
    this.graph.canvas.addEventListener('pointermove', this.onPointerMove)
  }

  disable() {
    this.graph.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  onPointerMove = (event: PointerEvent) => {
    const position = new Point(event.offsetX, event.offsetY)
    this.options.onPointerMove?.(position, event)
  }
}
