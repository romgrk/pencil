import { Point } from '2d-geometry'
import type { Shape } from '2d-geometry'
import type { Chart } from './Chart'
import type { Layer } from './Layer'
import { Base } from './Base'
import { Style } from './Style'

const EMPTY_LAYER = null as unknown as Layer

export class Node extends Base {
  chart: Chart
  layer: Layer
  shape: Shape
  style: Style

  constructor(chart: Chart, shape?: Shape, style?: Style) {
    super()
    this.chart = chart
    this.layer = EMPTY_LAYER
    this.shape = shape ?? Point.EMPTY
    this.style = style ?? Style.EMPTY
  }

  contains(p: Point) {
    return this.shape.contains(p)
  }

  render() {
    this.chart.pencil.style(this.style)
    this.chart.pencil.drawShape(this.shape)
  }
}
