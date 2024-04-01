import { useEffect, useRef } from 'react'
import * as graph from './Graph'
import * as linear from './LinearChart'

export function Graph(props: graph.Options) {
  const domNode = useRef<HTMLDivElement>()
  const instance = useRef<graph.Graph>()

  useEffect(() => {
    instance.current = new graph.Graph(domNode.current!, props)
  }, [])

  return (
    <div ref={domNode as any} />
  )
}

export function LinearChart(props: linear.Options) {
  const domNode = useRef<HTMLDivElement>()
  const instance = useRef<linear.LinearChart>()

  useEffect(() => {
    instance.current = new linear.LinearChart(domNode.current!, props)
  }, [])

  return (
    <div ref={domNode as any} />
  )
}
