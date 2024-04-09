import { Polygon, TAU } from '2d-geometry'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { tick } from '../graph/tick'
import * as elements from '../graph/elements'

export default class Demo extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    const layer = new Container([])

    const colors = [
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'cyan',
      'purple',
    ]
    let colorIndex = 0;

    for (let i = 0; i < 300; i++) {
      const color = colors[colorIndex++];
      if (colorIndex >= colors.length) {
        colorIndex = 0;
      }

      const width = Math.random() * 100 + 20
      const height = Math.random() * 100 + 20
      const x = Math.random() * this.width - 20
      const y = Math.random() * this.height - 20

      let polygon = new Polygon([
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
      ])
      polygon = polygon.translate(-polygon.box.width / 2, -polygon.box.height / 2)
      const box = new Node(polygon, Style.from({ lineWidth: 4, stroke: '#000000', fill: color }))
      box.x = x
      box.y = y

      layer.add(box)
    }

    const t = tick((_, dt) => {
      const angularSpeed = 100
      const angularDiff = (angularSpeed * dt) / 1000
      const angularDiffRad = angularDiff / 360 * TAU
      layer.children.forEach(n => {
        n.rotation += angularDiffRad
      })
      this.render()
    })
    t.start()
    this.defer(t.stop)
    // setTimeout(() => t.cancel(), 2000)


    this.root.add(new Container([new elements.Grid()]))
    this.root.add(layer)
    this.render()
  }
}

