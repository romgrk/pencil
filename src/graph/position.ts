import { Point, Matrix } from '2d-geometry'
import { Container } from './Container'

export function positionAtObject(object: Container, event: WheelEvent | PointerEvent) {
  let current = object.parent as Container | null

  let transforms = []
  while (current) {
    transforms.push(current.transform)
    current = current.parent
  }

  const t = new Matrix()
  for (let i = transforms.length - 1; i >= 0; i--) {
    t.multiplyMut(transforms[i])
  }

  return new Point(event.offsetX, event.offsetY).transform(t.invert())
}

export function positionAtObjectCached(
  object: Container,
  event: WheelEvent | PointerEvent,
  transformAtObject: Map<Container, Matrix>
) {
  let current = object.parent as Container | null

  // [current, parent, ..., parent, root]
  let nodes = []
  let rootTransform = Matrix.IDENTITY

  while (current) {
    const foundRootTransform = transformAtObject.get(current)
    if (foundRootTransform) {
      rootTransform = foundRootTransform
      break
    }

    nodes.push(current)

    current = current.parent
  }

  let currentTransform = rootTransform
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    transformAtObject.set(node, currentTransform)
    currentTransform = currentTransform.multiply(node.transform)
  }

  const t = currentTransform

  return new Point(event.offsetX, event.offsetY).transform(t.invert())
}
