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

This library is a thin visualization layer on top of [2d-geometry](https://github.com/romgrk/2d-geometry), which provides powerful mathematical primitives. `Node` elements are just a mathematical primitive with an associated `Style`, grouped under `Container` elements that have matrix transforms. The API is inspired & copied from PixiJS when possible.

## License

TBD - Do not use for now
