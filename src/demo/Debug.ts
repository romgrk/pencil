import { point, svg, Arc, Circle, Quadratic, TAU } from '2d-geometry'
import { Graph } from '../graph/Graph'
import { Container } from '../graph/Container'
import { Node } from '../graph/Node'
import { Style } from '../graph/Style'
import { animate, Animation } from '../graph/animate'
import * as elements from '../graph/elements'
import pencilPath from '../pencil.path'


const colors = [
  '#568fff',
  '#566eff',
  '#5451e7',
  '#7b51e7',
  '#a251e7',
  '#b551e7',
]

const paths = svg.parsePath(pencilPath)
// const paths = svg.parsePath('M 100,100 A 100,100 0.0 0 0 200,200')
console.log(paths[0].parts)

export class Debug extends Graph {
  constructor(domNode: any, options: any) {
    super(domNode, options)

    this.root.add(new Container([new elements.Grid()]))
    const content = new Container([])
    this.root.add(content)

    animate({ duration: 3000 }, f => {
      content.clear()
      paths.forEach((p, i) => {
        content.add(
          new Node(p.slice(0, p.length * f), Style.from({ lineWidth: 2, strokeStyle: colors[i % colors.length] }))
        )
      })
      this.render()
    })

    // const arc = new Arc(
    //   point(300, 300),
    //   200, 100,
    //   0,
    //   0, TAU / 2
    // )
    // content.add(new Node(arc, Style.from({ strokeStyle: colors[0] })))
    // const dotStyle = Style.from({ lineWidth: 2, strokeStyle: colors[1] })
    // content.add(new Node(new Circle(arc.end, 7), Style.from({ lineWidth: 2, strokeStyle: 'red' })))
    // content.add(new Node(new Circle(arc.start, 5), Style.from({ lineWidth: 2, strokeStyle: 'green' })))
    // content.add(new Node(new Circle(arc.center, 3), dotStyle))


    this.render()
  }
}

