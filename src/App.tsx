import { GraphContainer } from './graph/react'
import { LinearChart } from './demo/LinearChart'
import { Dataset } from './graph/Dataset'
import data from './node-gtk-downloads.json'

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

function App() {
  return (
    <div className='App'>
      {
        <GraphContainer<typeof LinearChart>
          type={LinearChart}
          width={800}
          height={500}
          dataset={dataset}
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

export default App
