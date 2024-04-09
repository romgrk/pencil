import type { Container } from './Container'

export function traverse(b: Container, fn: (b: Container) => void) {
  fn(b)
  b.children.forEach(c => traverse(c, fn))
}

export function applyIndexes(node: Container, ref = { nextId: 1 }) {
  node.index = ref.nextId++
  for (let i = 0; i < node.children.length; i++) {
    applyIndexes(node.children[i], ref)
  }
}


// { id: 1, children: [
//   { id: 2, children: [
//     { id: 3, children: [] },
//   ] },
//   { id: 4, children: [] },
// ] },
// { id: 5, children: [
// ] },
