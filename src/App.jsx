import { useState } from 'react'
import './App.css'
import Puzzel from './Components/Puzzel'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Puzzel  />
    </>
  )
}

export default App
