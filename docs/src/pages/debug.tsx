import { GraphContainer } from 'pencil'
// import { Debug } from './demo/Debug'
// import { PencilAnimation } from './demo/PencilAnimation'
// import { LinearChart } from './demo/LinearChart'
// import { DemoEvents } from './demo/DemoEvents'
// import DemoStressTestKonva from './demo/DemoStressTestKonva'
import { PathEditor } from '../demo/PathEditor'


export default function Index() {
  return (
    <div className='App'>
      {
        // <GraphContainer<typeof LinearChart>
        //   type={LinearChart}
        //   width={800}
        //   height={500}
        //   dataset={dataset}
        // />
      }
      {
        <GraphContainer
          type={PathEditor}
          width={800}
          height={500}
        />
      }
      {
        // <GraphContainer
        //   type={DemoEvents}
        //   width={800}
        //   height={500}
        // />
      }
      {
        // <GraphContainer
        //   type={DemoStressTestKonva}
        //   width={615}
        //   height={300}
        // />
      }
      {
        // <GraphContainer
        //   type={Debug}
        //   width={800}
        //   height={500}
        // />
      }
      {
        // <GraphContainer
        //   type={PencilAnimation}
        //   width={700}
        //   height={300}
        // />
      }
    </div>
  )
}
