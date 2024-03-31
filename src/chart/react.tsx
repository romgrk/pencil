import { useEffect, useRef } from 'react'
import * as chart from './Chart'
import * as linear from './LinearChart'

export function Chart(props: chart.Options) {
  const domNode = useRef<HTMLDivElement>()
  const instance = useRef<chart.Chart>()

  useEffect(() => {
    instance.current = new chart.Chart(domNode.current!, props)
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
