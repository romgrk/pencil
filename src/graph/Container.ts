import { Matrix } from '2d-geometry'
import type { Graph } from './Graph'
import { Base } from './Base'
import { traverse } from './traverse'

export class Container extends Base {

  constructor(children: Base[] = [], transform?: Matrix, mask?: Base, alpha?: number) {
    super()
    this.children = children
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }
    this.transform = transform ?? Matrix.IDENTITY.clone()
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
      if (child instanceof Container) {
        child.render(graph)
      } else {
        const needsContext = getNeedsContext(child)

        if (needsContext) {
          prepareRender(graph, child)
        }

        child.render(graph)

        if (needsContext) {
          graph.pencil.restore()
        }
      }
    }

    if (needsContext) {
      graph.pencil.restore()
    }
  }
}

function getNeedsContext(base: Base) {
  return !base.transform.isIdentity() || base.alpha !== 1 || base.mask !== null
}

function prepareRender(graph: Graph, base: Base) {
  graph.pencil.save()

  if (!base.transform.isIdentity()) {
    graph.ctx.transform(
      base.transform.a,
      base.transform.b,
      base.transform.c,
      base.transform.d,
      base.transform.tx,
      base.transform.ty,
    )
  }

  if (base.mask) {
    graph.pencil.mask(base.mask)
  }

  if (base.alpha !== 1) {
    graph.ctx.globalAlpha = graph.ctx.globalAlpha * base.alpha
  }
}
