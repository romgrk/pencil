import { GraphContainer } from 'pencil/react'
import { Link } from 'react-router-dom'
import { PencilAnimation } from '../demo/PencilAnimation'

export default function Index() {
  return (
    <div className='Page'>
      Pencil

      <GraphContainer
        type={PencilAnimation}
        width={700}
        height={300}
      />

      <Link to='/examples'>Examples</Link>
      <Link to='/debug'>Debug</Link>
    </div>
  )
}
