import './App.css'
import Chart from './chart/react'
import { Dataset } from './chart/Dataset'
import data from './node-gtk-downloads.json'

const partial = data.slice(-60)
const dataset = new Dataset(
  partial,
  (e) => Math.floor(Date.parse(e.day) / 8.64e7),
  (e) => e.downloads,
)

function App() {
  return (
    <div className='App'>
      <Chart
        width={800}
        height={500}
        dataset={dataset}
      />
    </div>
  )
}

export default App
