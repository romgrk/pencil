# Pencil

A canvas 2D drawing library, optimized for performance, bundle size and simplicity.


```typescript
import { Graph, Layer, Node, Style } from 'pencil'
import { Circle } from '2d-geometry'

class CustomGraph extends Graph {
  constructor(canvas) {
    super(canvas)

    this.layersByName.content = new Layer([
      new Node(new Circle(100, 100, 10), Style.from({ fillStyle: 'red' }))
    ])

    this.render()
  }
}

const newGraph = new CustomGraph(document.querySelector('canvas'))
```
