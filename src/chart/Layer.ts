import type { Matrix } from '2d-geometry'
import type { Chart } from './Chart'
import { Base } from './Base'
import { TRANSFORM_EMPTY } from './constants'

export class Layer extends Base {
  chart: Chart
  transform: Matrix
  mask: Base | null

  constructor(chart: Chart, children: Base[] = [], transform?: Matrix, mask?: Base) {
    super()
    this.chart = chart
    this.children = children
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this
    }
    this.transform = transform ?? TRANSFORM_EMPTY
    this.mask = mask ?? null
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

  render() {
    this.chart.ctx.save()

    if (this.transform) {
      this.chart.ctx.transform(
        this.transform.a,
        this.transform.b,
        this.transform.c,
        this.transform.d,
        this.transform.tx,
        -this.transform.ty,
      )
    }

    if (this.mask) {
      this.chart.pencil.mask(this.mask)
    }

    for (let j = 0; j < this.children.length; j++) {
      const node = this.children[j]
      node.render()
    }

    this.chart.ctx.restore()
  }
}

