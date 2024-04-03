import { Matrix } from '2d-geometry'
import type { Base } from './Base'

export function traverse(b: Base, fn: (b: Base) => void) {
  fn(b)
  b.children.forEach(c => traverse(c, fn))
}

export function traverseWithTransform(root: Base, fn: (element: Base, transform: Matrix) => void) {
  const transforms = [Matrix.IDENTITY]
  let currentTransform = transforms[0]

  function _recurse(element: Base, fn: (element: Base, transform: Matrix) => void) {
    currentTransform =
      element.transform === Matrix.IDENTITY ?
        currentTransform :
        currentTransform.multiply(element.transform)
    transforms.push(currentTransform)
    fn(element, currentTransform)
    for (let i = 0; i < element.children.length; i++) {
      _recurse(element.children[i], fn)
    }
    transforms.pop()
    currentTransform = transforms[transforms.length - 1]
  }

  _recurse(root, fn)
}
