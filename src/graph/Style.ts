
type LinearGradient = {
  positions: [number, number, number, number],
  stops: [number, string][],
}

export type StyleOptions = {
  lineWidth: number,
  stroke: LinearGradient | string | null,
  fill: LinearGradient | string | null,
}

const DEFAULT_OPTIONS = {
  lineWidth: 1,
  stroke: null,
  fill: null,
}

let nextId = 1

const styleByHash = new Map<string, Style>
const gradientMap = new WeakMap<LinearGradient, CanvasGradient>()

export class Style {
  id: number
  options: StyleOptions

  static EMPTY = Style.from({})

  static from(someOptions: Partial<StyleOptions>): Style;
  static from(lineWidth: number, stroke?: string | null, fill?: LinearGradient | string | null): Style;
  static from(a: unknown, b?: unknown, c?: unknown) {
    let options: StyleOptions
    let hash: string

    if (typeof a === 'object') {
      options = Object.assign({}, DEFAULT_OPTIONS, a)
      hash = options.lineWidth + '#' + options.stroke + '#' + JSON.stringify(options.fill)
      {
        const style = styleByHash.get(hash)
        if (style) {
          return style
        }
      }
      const style = new Style(nextId++, options)
      styleByHash.set(hash, style)
      return style
    }
    else {
      const lineWidth   = (a as number) ?? DEFAULT_OPTIONS.lineWidth
      const stroke = (b as string) ?? DEFAULT_OPTIONS.stroke
      const fill   = (c as string) ?? DEFAULT_OPTIONS.fill
      hash = lineWidth + '##' + stroke + '##' + fill
      {
        const style = styleByHash.get(hash)
        if (style) {
          return style
        }
      }
      options = { lineWidth, stroke, fill }
    }

    const style = new Style(nextId++, options)
    styleByHash.set(hash, style)
    return style
  }

  static linearGradient(context: CanvasRenderingContext2D, description: LinearGradient) {
    const result = gradientMap.get(description)
    if (result) {
      return result
    }
    const gradient = context.createLinearGradient(...description.positions)
    description.stops.forEach(s => {
      gradient.addColorStop(...s)
    })
    gradientMap.set(description, gradient)
    return gradient
  }

  private constructor(id: number, options: StyleOptions) {
    this.id = id
    this.options = options
  }

  stroke(ctx: CanvasRenderingContext2D) {
    if (this.options.stroke === null) {
      return
    }
    if (typeof this.options.stroke === 'string') {
      ctx.strokeStyle = this.options.stroke
      return
    }
    ctx.strokeStyle = Style.linearGradient(ctx, this.options.stroke)
  }

  fill(ctx: CanvasRenderingContext2D) {
    if (this.options.fill === null) {
      return
    }
    if (typeof this.options.fill === 'string') {
      ctx.fillStyle = this.options.fill
      return
    }
    ctx.fillStyle = Style.linearGradient(ctx, this.options.fill)
  }
}

