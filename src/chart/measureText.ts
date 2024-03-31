import type { TextStyle } from './TextStyle'

let canvas: HTMLCanvasElement | undefined
let context: CanvasRenderingContext2D | undefined

export function measureText(text: string, style: TextStyle) {
  if (!canvas || !context) {
    canvas = document.createElement('canvas')
    context = canvas.getContext('2d')!
  }

  context.font = style.options.font
  context.textAlign = style.options.textAlign
  context.textBaseline = style.options.textBaseline

  return context.measureText(text)
}
