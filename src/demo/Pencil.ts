import { svg, Matrix, Box } from '2d-geometry'
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
const boundingBox = paths.reduce((b, path) => b.merge(path.box), Box.EMPTY)

export class Pencil extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const container = new Container([], Matrix.IDENTITY.translate(100, 89))
    const content = new Container([], Matrix.IDENTITY.translate(boundingBox.center.x, boundingBox.center.y))
    container.add(content)
    this.root.add(container)


    let animations = []
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const node = new Node(path.slice(0, path.length * 0), Style.from({ lineWidth: 1, strokeStyle: colors[i % colors.length] }))
      node.x = -boundingBox.center.x
      node.y = -boundingBox.center.y
      content.add(node)

      const a = animate({ delay: i * 400, duration: 2000 }, f => {
        node.shape = path.slice(0, path.length * f)
        this.render()
      })
      animations.push(a)
    }

    Promise.all(animations).then(() =>
      animate({ duration: 500 }, f => {
        content.clear()

        for (let i = 0; i < paths.length; i++) {
          const path = paths[i]
          const node = new Node(
            path,
            Style.from({ lineWidth: 1 + 2 * f, strokeStyle: colors[i % colors.length] })
          )
          node.x = -boundingBox.center.x
          node.y = -boundingBox.center.y
          content.add(node)
        }

        this.render()
      })
    )

    this.render()
  }
}

