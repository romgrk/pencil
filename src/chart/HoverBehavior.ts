import type { Chart } from './Chart'

export type HoverOptions = {
  onHover?: (event: WheelEvent) => void,
}

export class HoverBehavior {
  chart: Chart
  options: HoverOptions

  constructor(chart: Chart, options: HoverOptions) {
    this.chart = chart
    this.options = options
  }

  enable() {
    this.chart.canvas.addEventListener('pointermove', this.onPointerMove)
  }

  disable() {
    this.chart.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  onPointerMove = (event: PointerEvent) => {
  }
}
