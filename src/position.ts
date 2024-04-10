import { Point, Matrix } from '2d-geometry'
import { Container } from './Container'

type Event = { offsetX: number, offsetY: number }

const transforms = [] as Matrix[]
export function positionAtObject(object: Container, event: Event) {
  let current = object as Container | null

  transforms.length = 0
  while (current) {
    if (current.hasTransform())
      transforms.push(current.transform)
    current = current.parent
  }

  const p = new Point(event.offsetX, event.offsetY)

  for (let i = transforms.length - 1; i >= 0; i--) {
    transforms[i].inverse.transformMut(p)
  }

  return p
}
