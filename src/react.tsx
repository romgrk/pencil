import { memo, useEffect, useRef } from 'react'
import * as graph from './Graph'

type Constructor = typeof graph.Graph

function GraphContainerImpl<T extends Constructor>(
    props: { type: T } & ConstructorParameters<T>[1])
{
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

export const GraphContainer = memo(GraphContainerImpl) as typeof GraphContainerImpl
