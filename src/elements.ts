import { Segment } from '2d-geometry'
import type { Graph } from './Graph'
import { Node } from './Node'
import { Style } from './Style'


export class Grid extends Node {
  static style = Style.from({ stroke: '#ff000033' })

  style: Style
  offset: number

  constructor(options?: { style?: Style, offset?: number }) {
    super()
    this.style = options?.style ?? Grid.style
    this.offset = options?.offset ?? 100
  }

  render(graph: Graph) {
    const { pencil } = graph

    pencil.style(this.style)

    for (let x = 0; x < graph.width; x += this.offset) {
      pencil.draw(
        new Segment(
          x, 0,
          x, graph.height,
        )
      )
    }
    pencil.draw(
      new Segment(
        graph.width - 1, 0,
        graph.width - 1, graph.height,
      )
    )

    for (let y = 1; y < graph.width; y += this.offset) {
      pencil.draw(
        new Segment(
          0, y,
          graph.width, y,
        )
      )
    }
    pencil.draw(
      new Segment(
        0, graph.height - 1,
        graph.width, graph.height - 1,
      )
    )
  }
}
