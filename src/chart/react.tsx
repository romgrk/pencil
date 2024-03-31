import { useEffect, useRef } from 'react'
import Chart, { Options } from './Chart'

type Props = Options

export default function Component(props: Props) {
  const domNode = useRef<HTMLDivElement>()
  const instance = useRef<Chart>()

  useEffect(() => {
    instance.current = new Chart(domNode.current!, props)
  }, [])

  return (
    <div ref={domNode as any} />
  )
}
