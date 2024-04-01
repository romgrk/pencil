import type { Graph } from './Graph'

export type HoverOptions = {
  onHover?: (event: WheelEvent) => void,
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
  }
}
