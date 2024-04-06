# Pencil

A canvas 2D drawing library, optimized for performance, bundle size and simplicity.

```typescript
import { Graph, Container, Node, Style } from 'pencil'
import { Circle } from '2d-geometry'

class CustomGraph extends Graph {
  constructor(canvas) {
    super(canvas)

    this.root.add(
      new Container([
        new Node(new Circle(100, 100, 10), Style.from({ fillStyle: 'red' }))
      ])
    )

    this.render()
  }
}

const newGraph = new CustomGraph(document.querySelector('canvas'))
```

## Design

This library is a thin visualization layer on top of [2d-geometry](https://github.com/romgrk/2d-geometry), which provides powerful mathematical primitives. `Node` elements are just a mathematical primitive with an associated `Style`, grouped under `Container` elements that have a matrix transforms. The API is inspired & copied from PixiJS when possible.

## Example

Apologies for the low-quality GIF, but it can hopefully demonstrate how powerful the primitives are. This runs at 60fps with sharp rendering when not compressed through GIF.

![demo](https://github.com/romgrk/pencil/assets/1423607/f07fb1d6-afb5-4036-9518-584a95dcbd2f)

```typescript
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
```

## License

TBD - Do not use for now
