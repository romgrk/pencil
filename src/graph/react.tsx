import { memo, useEffect, useRef } from 'react'
import * as graph from './Graph'

type GraphType = typeof graph.Graph

function GraphContainerImpl<T extends GraphType>(props: { type: T } & ConstructorParameters<GraphType>[1]) {
  const domNode = useRef<HTMLDivElement>()
  const instance = useRef<graph.Graph>()

  useEffect(() => {
    instance.current = new props.type(domNode.current!, props)
    return () => instance.current?.destroy()
  }, [props.type])

  return (
    <div ref={domNode as any} />
  )
}

export const GraphContainer = memo(GraphContainerImpl)
