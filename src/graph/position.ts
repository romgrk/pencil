import { Point, Matrix } from '2d-geometry'
import { Base } from './Base'

export function positionInObject(object: Base, event: WheelEvent | PointerEvent) {
  let current = object as Base | null

  let transforms = []
  while (current) {
    transforms.push(current.transform)
    current = current.parent
  }

  const t = transforms.reverse().reduce((acc, current) => acc.multiply(current), Matrix.IDENTITY)

  return new Point(event.offsetX, event.offsetY).transform(t.invert())
}
