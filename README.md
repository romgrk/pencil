# Pencil

[Live examples](https://pencil-docs.netlify.app/)

A canvas 2D drawing library, optimized for performance, bundle size and simplicity.

```typescript
import { Graph, Container, Node, Style } from 'pencil'
import { Circle } from '2d-geometry'

class CustomGraph extends Graph {
  constructor(canvas) {
    super(canvas)

    this.root.add(
      new Container([
        new Node(new Circle(100, 100, 10), Style.from({ fill: 'red' }))
      ])
    )

    this.render()
  }
}

const newGraph = new CustomGraph(document.querySelector('canvas'))
```

## Design

This library is a thin visualization layer on top of [2d-geometry](https://github.com/romgrk/2d-geometry), which provides powerful mathematical primitives. It's canvas-only (no SVG), so it can stay performant, small & simple. The API is inspired & copied from PixiJS when possible.

## Why not..

### SVG?

It's great if you can use it, but it performs less well than canvas. If you have graphs with lots of elements, or many small graphs, the UX is going to feel sluggish.

### PixiJS?

It's a gamedev library so the size is huge. WebGL/WebGPU is nice if you need it, but it's also a limitation as browsers only allow a limited number of WebGx contexts in a page (e.g. 16 in chrome).

### Konva or Two.js?

I have replicated the [stress test](https://konvajs.org/docs/sandbox/Animation_Stress_Test.html) and Pencil is substantially faster than both. Specializing Pencil for canvas 2dcontext means it can be optimized more easily.

| Konva | Two.js | Pencil |
| --- | --- | --- |
| ![test-konva](https://github.com/romgrk/pencil/assets/1423607/edc8f3aa-c76e-4dfe-be77-8e9a8ad6357f) | ![test-two](https://github.com/romgrk/pencil/assets/1423607/f7f9ed96-53f0-46bf-8b5d-2b974905334b) | ![test-pencil](https://github.com/romgrk/pencil/assets/1423607/32152afa-68cd-48d4-b132-b1252c4ca478) |

## License

TBD - Do not use for now
