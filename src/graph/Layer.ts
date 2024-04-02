import { Matrix } from '2d-geometry'
import type { Graph } from './Graph'
import { Base } from './Base'

export class Layer extends Base {

  constructor(children: Base[] = [], transform?: Matrix, mask?: Base, alpha?: number) {
    super()
    this.children = children
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }
    this.transform = transform ?? Matrix.IDENTITY
    this.mask = mask ?? null
    this.alpha = alpha ?? 1
  }

  add(node: Base) {
    node.parent = this
    this.children.push(node)
  }

  remove(node: Base) {
    if (node.parent === this) {
      this.children = this.children.filter(c => c !== node)
    }
  }

  clear() {
    this.children = []
  }

  query(tag: string): Base | null {
    try {
      traverse(this, child => {
        if (child.tags && child.tags.has(tag)) {
          throw child
        }
      })
    } catch (result: any) {
      return result
    }
    return null
  }

  queryAll(tag: string) {
    const result = [] as Base[]
    traverse(this, child => {
      if (child.tags && child.tags.has(tag)) {
        result.push(child)
      }
    })
    return result
  }

  render(graph: Graph) {
    const needsContext = getNeedsContext(this)

    if (needsContext) {
      prepareRender(graph, this)
    }

    for (let j = 0; j < this.children.length; j++) {
      const child = this.children[j]
      if (child instanceof Layer) {
        child.render(graph)
      } else {
        const needsContext = getNeedsContext(child)

        if (needsContext) {
          prepareRender(graph, child)
        }

        child.render(graph)

        if (needsContext) {
          graph.ctx.restore()
        }
      }
    }

    if (needsContext) {
      graph.ctx.restore()
    }
  }
}

function getNeedsContext(base: Base) {
  return base.transform !== Matrix.IDENTITY || base.alpha !== 1 || base.mask !== null
}

function prepareRender(graph: Graph, base: Base) {
  graph.ctx.save()

  if (base.transform !== Matrix.IDENTITY) {
    graph.ctx.transform(
      base.transform.a,
      base.transform.b,
      base.transform.c,
      base.transform.d,
      base.transform.tx,
      -base.transform.ty,
    )
  }

  if (base.mask) {
    graph.pencil.mask(base.mask)
  }

  if (base.alpha !== 1) {
    graph.ctx.globalAlpha = graph.ctx.globalAlpha * base.alpha
  }
}


export function traverse(b: Base, fn: (b: Base) => void) {
  fn(b)
  if (b instanceof Layer) {
    b.children.forEach(c => traverse(c, fn))
  }
}
