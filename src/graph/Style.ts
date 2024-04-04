
type LinearGradient = {
  positions: [number, number, number, number],
  stops: [number, string][],
}

export type StyleOptions = {
  lineWidth: number,
  strokeStyle: LinearGradient | string | null,
  fillStyle: LinearGradient | string | null,
}

const DEFAULT_OPTIONS = {
  lineWidth: 1,
  strokeStyle: null,
  fillStyle: null,
}

let nextId = 1

const styleByHash = new Map<string, Style>
const gradientMap = new WeakMap<LinearGradient, CanvasGradient>()

export class Style {
  id: number
  options: StyleOptions

  static EMPTY = Style.from({})

  static from(someOptions: Partial<StyleOptions>): Style;
  static from(lineWidth: number, strokeStyle?: string | null, fillStyle?: LinearGradient | string | null): Style;
  static from(a: unknown, b?: unknown, c?: unknown) {
    let options: StyleOptions
    let hash: string

    if (typeof a === 'object') {
      options = Object.assign({}, DEFAULT_OPTIONS, a)
      hash = options.lineWidth + '#' + options.strokeStyle + '#' + JSON.stringify(options.fillStyle)
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
      const strokeStyle = (b as string) ?? DEFAULT_OPTIONS.strokeStyle
      const fillStyle   = (c as string) ?? DEFAULT_OPTIONS.fillStyle
      hash = lineWidth + '##' + strokeStyle + '##' + fillStyle
      {
        const style = styleByHash.get(hash)
        if (style) {
          return style
        }
      }
      options = { lineWidth, strokeStyle, fillStyle }
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

  strokeStyle(ctx: CanvasRenderingContext2D) {
    if (this.options.strokeStyle === null) {
      return
    }
    if (typeof this.options.strokeStyle === 'string') {
      ctx.strokeStyle = this.options.strokeStyle
      return
    }
    ctx.strokeStyle = Style.linearGradient(ctx, this.options.strokeStyle)
  }

  fillStyle(ctx: CanvasRenderingContext2D) {
    if (this.options.fillStyle === null) {
      return
    }
    if (typeof this.options.fillStyle === 'string') {
      ctx.fillStyle = this.options.fillStyle
      return
    }
    ctx.fillStyle = Style.linearGradient(ctx, this.options.fillStyle)
  }
}

