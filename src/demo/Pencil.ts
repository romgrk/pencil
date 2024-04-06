import { Matrix } from '2d-geometry'
import { parsePath } from '2d-geometry/svg'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { animate } from '../graph/animate'
import * as elements from '../graph/elements'
import * as PENCIL from './pencil.path'

const colors = [
  '#5e75ff',
  '#5451e7',
  '#6051E7',
  '#7b51e7',
  '#a251e7',
  '#b551e7',
]

const paths = PENCIL.LETTERS.map(letter => parsePath(letter, { split: false })[0])

export class Pencil extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    const strokes = new Container([], Matrix.IDENTITY.translate(100, 89))
    const filling = new Container([], Matrix.IDENTITY.translate(100, 89))
    filling.alpha = 0

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(filling)
    this.root.add(strokes)
    this.render()

    Promise.resolve()
    .then(() => {
      let animations = []
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const node = new Node(path.slice(0, path.length * 0), Style.from({ lineWidth: 1, strokeStyle: colors[i % colors.length] }))
        strokes.add(node)

        const n = 200
        animations.push(animate({ delay: i * n, duration: n * 18 }, f => {
          node.shape = path.slice(0, path.length * f)
          this.render()
        }))
      }

      return Promise.all(animations)
    })
    .then(() => {
      for (let i = 0; i < paths.length; i++) {
        filling.add(new Node(paths[i], Style.from({ fillStyle: colors[i % colors.length] })))
      }
      return animate({duration: 1000}, f => {
        filling.alpha = 0.8 * f
        this.render()
      })
    })
  }
}

