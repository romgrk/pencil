import type { Matrix } from '2d-geometry'
import type { Chart } from './Chart'
import { Base } from './Base'
import { TRANSFORM_EMPTY } from './constants'

export class Layer extends Base {
  transform: Matrix
  mask: Base | null
  alpha: number

  constructor(children: Base[] = [], transform?: Matrix, mask?: Base, alpha?: number) {
    super()
    this.children = children
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }
    this.transform = transform ?? TRANSFORM_EMPTY
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

  render(chart: Chart) {
    chart.ctx.save()

    if (this.transform) {
      chart.ctx.transform(
        this.transform.a,
        this.transform.b,
        this.transform.c,
        this.transform.d,
        this.transform.tx,
        -this.transform.ty,
      )
    }

    if (this.mask) {
      chart.pencil.mask(this.mask)
    }

    chart.ctx.globalAlpha = chart.ctx.globalAlpha * this.alpha

    for (let j = 0; j < this.children.length; j++) {
      const node = this.children[j]
      node.render(chart)
    }

    chart.ctx.restore()
  }
}

