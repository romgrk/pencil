import { Bezier, Box, Path, Matrix, Point, Segment, Circle } from '2d-geometry'
import { Node, TextNode } from './Node'
import { Dataset } from './Dataset'
import { Layer } from './Layer'
import { Style } from './Style'
import { TextStyle } from './TextStyle'
import { DragBehavior } from './DragBehavior'
import { ScrollBehavior } from './ScrollBehavior'
import { HoverBehavior } from './HoverBehavior'
import { linearScale, LinearScale } from './linearScale'
import animate, { Easing } from './animate'
import { traverseWithTransform } from './traverse'
import * as Interval from './interval'
import { PIXEL_RATIO } from './constants'
import * as chart from './Graph'
import { Graph } from './Graph'

export type Options = chart.Options

const colors = {
  debug: '#ff0000dd',
  axisLine: '#aaa',
  axisLabel: '#777',
  pointFill: '#599eff',
  pathStroke: '#599eff',
}

const PADDING = 50
const AXIS_ORIGIN = new Point(PADDING, PADDING)

const LABEL_TEXT_STYLE = TextStyle.from({
  font: '16px serif',
  textAlign: 'center',
  textBaseline: 'top',
})
const LABEL_STYLE = Style.from({ fillStyle: colors.axisLabel })

const AXIS_TICK_STYLE = Style.from({ lineWidth: 2, strokeStyle: colors.axisLine })

class AxisNode extends Node {
  static style = Style.from({ strokeStyle: colors.axisLine })

  factor: number = 1

  render(chart: Graph) {
    const { pencil } = chart

    pencil.style(AxisNode.style)
    pencil.draw(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(0, this.factor * (chart.height - 2 * PADDING)),
      )
    )
    pencil.draw(
      new Segment(
        AXIS_ORIGIN,
        AXIS_ORIGIN.translate(this.factor * (chart.width - 2 * PADDING), 0),
      )
    )
  }
}

class GridNode extends Node {
  static style = Style.from({ strokeStyle: '#ff000033' })

  render(graph: Graph) {
    const { pencil } = graph

    pencil.style(GridNode.style)

    for (let x = 0; x < graph.width; x += 100) {
      pencil.draw(
        new Segment(
          x, 0,
          x, graph.height,
        )
      )
    }
    for (let y = 1; y < graph.width; y += 100) {
      pencil.draw(
        new Segment(
          0, y,
          graph.width, y,
        )
      )
    }
  }
}


class PathNode extends Node {
  static style = Style.from({
    lineWidth: 2,
    strokeStyle: colors.pathStroke
  })

  static buildPath(chart: LinearChart, dataset: Dataset) {
    // See https://proandroiddev.com/drawing-bezier-curve-like-in-google-material-rally-e2b38053038c
    const points = dataset.entries.map(entry => [
      chart.scale.x(dataset.xGet(entry)),
      chart.scale.y(dataset.yGet(entry)),
    ])
    const controlPoints1 = [] as [number, number][]
    const controlPoints2 = [] as [number, number][]
    for (let i = 1; i < points.length; i++) {
      controlPoints1.push([(points[i][0] + points[i - 1][0]) / 2, points[i - 1][1]])
      controlPoints2.push([(points[i][0] + points[i - 1][0]) / 2, points[i][1]])
    }

    const parts = [] as Bezier[]
    for (let i = 1; i < points.length; i++) {
      const curve = new Bezier(
        new Point(points[i - 1][0], points[i - 1][1]),

        new Point(controlPoints1[i - 1][0], controlPoints1[i - 1][1]),
        new Point(controlPoints2[i - 1][0], controlPoints2[i - 1][1]),

        new Point(points[i][0], points[i][1]),
      )
      parts.push(curve)
    }

    return new Path(parts)
  }

  fullShape: Path

  constructor(chart: LinearChart, dataset: Dataset) {
    super()

    this.addTag('path')
    this.shape = PathNode.buildPath(chart, dataset)
    this.style = PathNode.style
    this.fullShape = this.shape as Path
  }
}

class PathAreaNode extends Node {
  constructor(chart: LinearChart, dataset: Dataset) {
    super()

    const path = PathNode.buildPath(chart, dataset)
    path.parts.unshift(new Segment(
      new Point(path.parts[0].start.x, 0),
      path.parts[0].start,
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, 0),
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, 0),
    ))

    this.shape = path
    this.style = Style.from({
      fillStyle: {
        positions: [0, 0, 0, chart.content.height],
        stops: [
          [0.0, colors.pathStroke + '55'],
          [0.6, colors.pathStroke + '22'],
          [1.0, colors.pathStroke + '0A'],
        ],
      }
    })
  }
}

export class LinearChart extends chart.Graph {
  content: Box
  dataset: Dataset
  scale: {
    x: LinearScale,
    y: LinearScale,
  }

  constructor(root: HTMLElement, options: Options) {
    super(root, options)

    this.content = new Box(PADDING, PADDING, this.width - PADDING, this.height - PADDING)

    this.dataset = options.dataset
    this.scale = {
      x: linearScale(
        [this.dataset.stats.range.minX, this.dataset.stats.range.maxX],
        [0, this.content.width]
      ),
      y: linearScale(
        [this.dataset.stats.range.minY / 4, this.dataset.stats.range.maxY * 1.1],
        [0, this.content.height]
      ),
    }

    this.layersByName.content = new Layer(
      [],
      Matrix.IDENTITY.translate(this.content.xmin, this.content.ymin)
    )

    const axisNode = new AxisNode()
    this.layersByName.axis = new Layer([axisNode])

    const pathNode = new PathNode(this, this.dataset)
    const pathAreaNode = new PathAreaNode(this, this.dataset)
    this.layersByName.path = new Layer([
      pathNode,
      pathAreaNode,
    ])
    this.layersByName.points = new Layer([])
    this.layersByName.points.addTag('path')
    this.layersByName.xLabels = new Layer([])

    this.layersByName.content.add(this.layersByName.path)
    this.layersByName.content.add(this.layersByName.points)
    this.layersByName.content.add(this.layersByName.xLabels)

    this.root.add(new Layer([new GridNode()]))
    this.root.add(this.layersByName.content)
    this.root.add(this.layersByName.axis)

    const cursorShape = new Circle(100, 100, 10)
    const cursor = new Node(cursorShape, Style.from({ strokeStyle: 'red' }))
    this.root.add(new Layer([cursor]))

    const drag = new DragBehavior(this, {
      onStart: () => {
        this.root.queryAll('path').forEach(p => {
          p.alpha = 0.7
        })
        this.render()
      },
      onMove: (_, dx) => {
        const content = this.layersByName.content
        content.transform = content.transform.translate(dx, 0)
        this.render()
      },
      onEnd: () => {
        this.root.queryAll('path').forEach(p => {
          p.alpha = 1
        })
        this.render()
      },
    })
    drag.enable()
    this.mixins.push(drag)

    const scroll = new ScrollBehavior(this, {
      onScrollHorizontal: (event) => {
        const content = this.layersByName.content
        content.transform = content.transform.translate(
          event.deltaX / PIXEL_RATIO,
          0
        )
        this.render()
      },
      onScrollVertical: (event) => {
        const rangeWidth = this.scale.x.range[1] - this.scale.x.range[0]
        const dw = rangeWidth * 0.01 * (event.deltaY > 0 ? -1 : 1)

        const range = Interval.clampWidth([
          this.scale.x.range[0] - dw,
          this.scale.x.range[1] + dw,
        ] as [number, number], 400, 2_500)

        const xScale = linearScale(this.scale.x.domain, range)
        this.scale.x = xScale

        const pathNode = new PathNode(this, this.dataset)
        const pathAreaNode = new PathAreaNode(this, this.dataset)
        this.layersByName.path.clear()
        this.layersByName.path.add(pathNode)
        this.layersByName.path.add(pathAreaNode)

        this.populateDataset()
        this.render()
      },
    })
    scroll.enable()
    this.mixins.push(scroll)

    const hover = new HoverBehavior(this, {
      onPointerMove: (position) => {

        cursorShape.pc.x = position.x
        cursorShape.pc.y = position.y

        traverseWithTransform(this.layersByName.content, (element, transform) => {
          if (element instanceof Node) {
            const currentPosition = position.transform(transform.invert())

            if (element.shape.contains(currentPosition)) {
              animate({ from: 1, to: 2 }, (scale) => {
                element.transform = Matrix.IDENTITY.scale(scale, scale)
                this.render()
              })
            }
          }
        })

        this.render()
      },
    })
    hover.enable()
    this.mixins.push(hover)


    // Setup

    pathNode.shape = Path.EMPTY
    pathAreaNode.alpha = 0
    this.populateDataset(0, 0)
    this.render()

    animate({ duration: 500, easing: Easing.EASE_IN_OUT }, (f) => {
      axisNode.factor = f
      this.render()
    })
    .then(() =>
      animate({ from: 0, to: pathNode.fullShape.length, duration: 1_000, easing: Easing.EASE_IN_OUT },
        (length, done) => {
          if (done) {
            pathNode.shape = pathNode.fullShape
          } else {
            pathNode.shape = pathNode.fullShape.slice(0, length)
          }
          this.render()
        }
      )
    )
    .then(() =>
      animate({ from: 0, to: 3, duration: 250, easing: Easing.LINEAR }, (r) => {
        this.populateDataset(r, 0)
        this.render()
      })
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 500, easing: Easing.LINEAR }, (f) => {
        this.populateDataset(3, f)
        this.render()
      })
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 500, easing: Easing.LINEAR }, (f) => {
        pathAreaNode.alpha = f
        this.render()
      })
    )
  }

  populateDataset(r: number = 3, a: number = 1) {
    const dataset = this.dataset
    const points = this.layersByName.points
    const xLabels = this.layersByName.xLabels
    points.clear()
    xLabels.clear()
    xLabels.alpha = a

    let lastLabelX = -Infinity
    for (let i = 0; i < dataset.entries.length; i++) {
      const entry = dataset.entries[i]
      const x = this.scale.x(dataset.xGet(entry))
      const y = this.scale.y(dataset.yGet(entry))
      points.add(new Node(
        new Circle(new Point(x, y), r),
        Style.from({ fillStyle: colors.pointFill })
      ))
      if (lastLabelX < x) {
        const textNode = new TextNode(
          dataset.xLabel(entry),
          new Point(x, -5),
          LABEL_TEXT_STYLE,
          LABEL_STYLE,
        )
        lastLabelX = x + textNode.dimensions.width + 40
        xLabels.add(new Layer([
          new Node(new Segment(x, -3, x, 3), AXIS_TICK_STYLE),
          textNode,
        ]))
      }
    }
  }

}
