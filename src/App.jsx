import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import EarthquakeVisualizer from './EarthquakeVisualizer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>


      <EarthquakeVisualizer />


    </>
  )
}

export default App
