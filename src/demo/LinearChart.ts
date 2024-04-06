import { Bezier, Box, Path, Matrix, Point, Segment, Circle, lerp } from '2d-geometry'
import { Node, Text } from '../graph/Node'
import { Dataset } from '../graph/Dataset'
import { Container } from '../graph/Container'
import { Style } from '../graph/Style'
import { TextStyle } from '../graph/TextStyle'
import { DragBehavior } from '../graph/DragBehavior'
import { ScrollBehavior } from '../graph/ScrollBehavior'
import { MoveBehavior } from '../graph/MoveBehavior'
import { linearScale, LinearScale } from '../graph/linearScale'
import { animate, Easing } from '../graph/animate'
import { traverseWithTransform } from '../graph/traverse'
import { positionAtObject } from '../graph/position'
import * as Interval from '../graph/interval'
import { PIXEL_RATIO } from '../graph/constants'
import * as elements from '../graph/elements'
import * as chart from '../graph/Graph'
import { Graph } from '../graph/Graph'

export type Options = chart.Options & {
  dataset: Dataset<any>,
}

const colors = {
  debug: '#ff0000dd',
  axisLine: '#aaa',
  axisLabel: '#777',
  pointFill: '#599eff',
  pathStroke: '#599eff',
}

const PADDING = 50

const AXIS_TICK_STYLE = Style.from({ lineWidth: 2, strokeStyle: colors.axisLine })
const LABEL_STYLE = Style.from({ fillStyle: colors.axisLabel })
const LABEL_TEXT_STYLE = TextStyle.from({
  font: '16px serif',
  textAlign: 'center',
  textBaseline: 'top',
})

class AxisLines extends Node {
  static style = Style.from({ strokeStyle: colors.axisLine })

  factor: number = 1

  render(chart: Graph) {
    const { pencil } = chart

    const origin = new Point(PADDING, chart.height - PADDING)

    pencil.style(AxisLines.style)
    pencil.draw(
      new Segment(
        origin,
        origin.translate(0, this.factor * -(chart.height - 2 * PADDING)),
      )
    )
    pencil.draw(
      new Segment(
        origin,
        origin.translate(this.factor * (chart.width - 2 * PADDING), 0),
      )
    )
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
      new Point(path.parts[0].start.x, chart.content.height),
      path.parts[0].start,
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, chart.content.height),
    ))
    path.parts.push(new Segment(
      path.parts[path.parts.length - 1].end,
      new Point(path.parts[path.parts.length - 1].end.x, chart.content.height),
    ))

    this.shape = path
    this.style = Style.from({
      fillStyle: {
        positions: [0, 0, 0, chart.content.height],
        stops: [
          [0.0, colors.pathStroke + '11'],
          [0.6, colors.pathStroke + '11'],
          [1.0, colors.pathStroke + '11'],
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
        [this.content.height, 0]
      ),
    }

    this.layersByName.container = new Container(
      [],
      Matrix.IDENTITY.translate(this.content.xmin, this.content.ymin)
    )
    this.layersByName.content = new Container([])

    const axisNode = new AxisLines()
    this.layersByName.axis = new Container([axisNode])

    const pathNode = new PathNode(this, this.dataset)
    const pathAreaNode = new PathAreaNode(this, this.dataset)
    this.layersByName.path = new Container([
      pathNode,
      pathAreaNode,
    ])
    this.layersByName.points = new Container([])
    this.layersByName.points.addTag('path')
    this.layersByName.xLabels = new Container([])

    this.layersByName.content.add(this.layersByName.path)
    this.layersByName.content.add(this.layersByName.points)
    this.layersByName.content.add(this.layersByName.xLabels)

    this.layersByName.container.add(this.layersByName.content)

    this.root.add(new Container([new elements.Grid()]))
    this.root.add(this.layersByName.container)
    this.root.add(this.layersByName.axis)

    const cursorShape = new Circle(100, 100, 10)
    const cursor = new Node(cursorShape, Style.from({ strokeStyle: 'red' }))
    this.root.add(new Container([cursor]))

    const drag = new DragBehavior(this, {
      onStart: () => {
        this.root.queryAll('path').forEach((p: Container) => {
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
        this.root.queryAll('path').forEach((p: Container) => {
          p.alpha = 1
        })
        this.render()
      },
    })
    drag.enable()
    this.mixins.drag = drag

    let scrollAnimation: Promise<void> | undefined
    const scroll = new ScrollBehavior(this, {
      onScrollHorizontal: (event) => {
        const content = this.layersByName.content
        content.transform = content.transform.translate(
          event.deltaX / PIXEL_RATIO,
          0
        )
        // FIXME:
        // content.transform.tx = Math.min(content.transform.tx, 100)
        // content.transform.tx = Math.max(content.transform.tx, -100)
        this.render()
      },
      onScrollVertical: (event) => {
        if (scrollAnimation) {
          return
        }
        if (event.deltaX !== 0) {
          return
        }

        const position = positionAtObject(this.layersByName.content, event)

        const currentWidth = this.scale.x.domain[1] - this.scale.x.domain[0]
        const nextWidth = currentWidth * (event.deltaY < 0 ? 0.5 : 2)

        const n = position.x / (this.scale.x.range[1] - this.scale.x.range[0])

        const center = this.scale.x.domain[0] + currentWidth * n

        const extent = this.dataset.stats.range.maxX - this.dataset.stats.range.minX
        if (nextWidth < extent / 10 || nextWidth > extent) {
          return
        }

        scrollAnimation = animate({
          from: 0,
          to: 1,
        }, (f) => {
          const domainWidth = lerp(currentWidth, nextWidth, f)
          const domain = Interval.clampWidth([
            center - domainWidth * n,
            center + domainWidth * (1 - n),
          ] as [number, number], extent / 10, extent)

          this.scale.x = linearScale(domain, this.scale.x.range)

          const pathNode = new PathNode(this, this.dataset)
          const pathAreaNode = new PathAreaNode(this, this.dataset)
          this.layersByName.path.clear()
          this.layersByName.path.add(pathNode)
          this.layersByName.path.add(pathAreaNode)

          this.populateDataset()

          this.render()
        })
        .then(() => { scrollAnimation = undefined })
      },
    })
    scroll.enable()
    this.mixins.scroll = scroll

    const hover = new MoveBehavior(this, {
      onPointerMove: (event) => {
        const position = new Point(event.offsetX, event.offsetY)

        cursorShape.pc.x = position.x
        cursorShape.pc.y = position.y

        traverseWithTransform(this.layersByName.content, (element, _transform) => {
          if (element.tags?.has('point')) {
            const circle = (element.children[0] as Node)
            const currentPosition = positionAtObject(circle, event)

            if (circle.shape.contains(currentPosition)) {
              animate({ from: element.scale, to: 2 }, (scale) => {
                element.scale = scale
                this.render()
              })
            }
          }
        })

        this.render()
      },
    })
    hover.enable()
    this.mixins.hover = hover


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
      animate({ from: 0, to: 1, duration: 250, easing: Easing.LINEAR }, (f) => {
        this.populateDataset(1 + 2 * f, 0)
        this.render()
      })
    )
    .then(() =>
      animate({ from: 0, to: 1, duration: 500, easing: Easing.LINEAR }, (f) => {
        pathAreaNode.alpha = f
        this.populateDataset(3, f)
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

      const point = new Container([
        new Node(
          new Circle(0, 0, r), Style.from({ fillStyle: colors.pointFill })
        )
      ])
      point.addTag('point')
      point.x = x
      point.y = y

      points.add(point)

      if (lastLabelX < x) {
        const textNode = new Text(
          dataset.xLabel(entry),
          new Point(x, this.content.height + 5),
          LABEL_TEXT_STYLE,
          LABEL_STYLE,
        )
        lastLabelX = x + textNode.dimensions.width + 40
        xLabels.add(new Container([
          new Node(new Segment(
            x,
            -3 + this.content.height,
            x,
            3 + this.content.height,
          ), AXIS_TICK_STYLE),
          textNode,
        ]))
      }
    }
  }

}
