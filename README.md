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

This library is a thin visualization layer on top of [2d-geometry](https://github.com/romgrk/2d-geometry), which provides powerful mathematical primitives. `Node` elements are one mathematical primitive with one `Style`, grouped under `Container` elements. The API is inspired & copied from PixiJS when possible.

## Example

Apologies for the low-quality GIF, but it can hopefully demonstrate how powerful the primitives are. This runs at 60fps with sharp rendering when not compressed through GIF.

![demo](https://github.com/romgrk/pencil/assets/1423607/f07fb1d6-afb5-4036-9518-584a95dcbd2f)

This example is implemented in [65 lines](https://github.com/romgrk/pencil/blob/master/src/demo/Pencil.ts).

## License

TBD - Do not use for now
