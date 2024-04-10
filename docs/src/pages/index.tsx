import { GraphContainer } from 'pencil/react'
import { PencilAnimation } from '../demo/PencilAnimation'

export default function Index() {
  return (
    <div className='App'>
      Pencil
      <GraphContainer
        type={PencilAnimation}
        width={700}
        height={300}
      />
    </div>
  )
}
