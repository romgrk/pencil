export type TextStyleOptions = {
  font: string
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
}

const DEFAULT_OPTIONS = {
  font: '10px sans-serif',
  textAlign: 'start' as const,
  textBaseline: 'alphabetic' as const,
}

export class TextStyle {
  id: number
  options: TextStyleOptions

  static nextId = 1
  static textByHash = new Map<string, TextStyle>

  static EMPTY = TextStyle.from({})

  static from(someOptions: Partial<TextStyleOptions>): TextStyle;
  static from(font: string, textAlign?: string | null, textBaseline?: string | null): TextStyle;
  static from(a: unknown, b?: unknown, c?: unknown) {
    let options: TextStyleOptions
    let hash: string

    if (typeof a === 'object') {
      options = Object.assign({}, DEFAULT_OPTIONS, a)
      hash = options.font + '#' + options.textAlign + '#' + options.textBaseline
      {
        const style = TextStyle.textByHash.get(hash)
        if (style) {
          return style
        }
      }
      const style = new TextStyle(TextStyle.nextId++, options)
      TextStyle.textByHash.set(hash, style)
      return style
    }
    else {
      const font         = (a as string) ?? DEFAULT_OPTIONS.font
      const textAlign    = (b as CanvasTextAlign) ?? DEFAULT_OPTIONS.textAlign
      const textBaseline = (c as CanvasTextBaseline) ?? DEFAULT_OPTIONS.textBaseline
      hash = font + '##' + textAlign + '##' + textBaseline
      {
        const style = TextStyle.textByHash.get(hash)
        if (style) {
          return style
        }
      }
      options = { font, textAlign, textBaseline }
    }

    const style = new TextStyle(TextStyle.nextId++, options)
    TextStyle.textByHash.set(hash, style)
    return style
  }

  constructor(id: number, options: TextStyleOptions) {
    this.id = id
    this.options = options
  }
}

