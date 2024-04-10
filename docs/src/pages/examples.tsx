import { Tabs } from '@mantine/core'
import { Link } from 'react-router-dom'
import { GraphContainer } from 'pencil'
// import { Debug } from './demo/Debug'
import { PencilAnimation } from '../demo/PencilAnimation'
import { LinearChart } from '../demo/LinearChart'
import { Dataset } from '../Dataset'
import { DemoEvents } from '../demo/DemoEvents'
import DemoStressTestKonva from '../demo/DemoStressTestKonva'
import { PathEditor } from '../demo/PathEditor'
import data from '../node-gtk-downloads.json'

const byWeek = data.reduce((result, item, index) => { 
  const chunkIndex = Math.floor(index / 7)
  if (!result[chunkIndex]) {
    result[chunkIndex] = [] as typeof data
  }
  result[chunkIndex].push(item)
  return result
}, [] as (typeof data)[])
const weeks = byWeek.reduce((result, xs) => {
  if (xs.length < 7)
    return result
  result.push({
    day: xs[0].day,
    downloads: xs.reduce((a, x) => a + x.downloads, 0),
  })
  return result
}, [])

const partial = weeks.slice(10, 20)
const dataset = new Dataset(
  partial,
  {
    xGet: (e) => Math.floor(Date.parse(e.day) / 8.64e7),
    yGet: (e) => e.downloads,
    xLabel: (e) => e.day
  }
)

const tabs = [
  {
    name: 'linear-chart',
    content:
      <>
        <p>
          Simple interactive linear chart.
        </p>
        <GraphContainer<typeof LinearChart>
          type={LinearChart}
          width={800}
          height={500}
          dataset={dataset}
        />
      </>
  },
  {
    name: 'path-editor',
    content:
      <>
        <p>
        Building an interactive path editor app.
        </p>
        <GraphContainer
          type={PathEditor}
          width={800}
          height={500}
        />
      </>
  },
  {
    name: 'demo-events',
    content:
      <>
        <p>
          This demo shows event handling. Each small circle has events for pointerover, pointerout,
          pointerup, pointerdown, pointerclick and drag. The big circle has pointerend and pointerleave events.
        </p>
        <GraphContainer
          type={DemoEvents}
          width={800}
          height={500}
        />
      </>
  },
  {
    name: 'demo-stress-test',
    content:
      <>
        <p>
          Replication of the <a href='https://konvajs.org/docs/sandbox/Animation_Stress_Test.html'>Konva animation stress test</a>.
        </p>
        <GraphContainer
          type={DemoStressTestKonva}
          width={615}
          height={300}
        />
      </>
  },
  {
    name: 'pencil',
    content:
      <>
        <p>
          Animating a path.
        </p>
        <GraphContainer
          type={PencilAnimation}
          width={700}
          height={300}
        />
      </>
  },
]

export default function Demo() {
  return (
    <div className='Page'>
      <Link to='/'>Home</Link>

      <Tabs defaultValue={tabs[0].name} keepMounted={false}>
        <Tabs.List>
          {tabs.map(tab =>
            <Tabs.Tab key={tab.name} value={tab.name}>
              {tab.name}
            </Tabs.Tab>
          )}
        </Tabs.List>
        {tabs.map(tab =>
          <Tabs.Panel key={tab.name} value={tab.name}>
            <div>
              {tab.content}
            </div>
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  )
}
