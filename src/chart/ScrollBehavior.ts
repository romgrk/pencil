import type { Chart } from './Chart'

export type ScrollOptions = {
  onScrollHorizontal?: (event: WheelEvent) => void,
  onScrollVertical?: (event: WheelEvent) => void,
}

export class ScrollBehavior {
  chart: Chart
  options: ScrollOptions

  constructor(chart: Chart, options: ScrollOptions) {
    this.chart = chart
    this.options = options
  }

  enable() {
    this.chart.canvas.addEventListener('wheel', this.onWheel)
  }

  disable() {
    this.chart.canvas.removeEventListener('wheel', this.onWheel)
  }

  onWheel = (event: WheelEvent) => {
    const dx = event.deltaX
    const dy = event.deltaY
    const isHorizontal = Math.abs(dx) > Math.abs(dy)

    if (isHorizontal) {
      this.options.onScrollHorizontal?.(event)
    } else {
      this.options.onScrollVertical?.(event)
    }
  }
}
