import { svg, Matrix } from '2d-geometry'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { animate } from '../graph/animate'
import * as elements from '../graph/elements'
import pencilPath from './pencil.path'

const colors = [
  '#568fff',
  '#566eff',
  '#5451e7',
  '#7b51e7',
  '#a251e7',
  '#b551e7',
]

const paths = svg.parsePath(pencilPath)

export class Pencil extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([], Matrix.IDENTITY.translate(100, 89))
    this.root.add(content)

    animate({ duration: 3000 }, f => {
      content.clear()
      paths.forEach((path, i) => {
        content.add(
          new Node(path.slice(0, path.length * f), Style.from({ lineWidth: 3, strokeStyle: colors[i % colors.length] }))
        )
      })
      this.render()
    })

    this.render()
  }
}

