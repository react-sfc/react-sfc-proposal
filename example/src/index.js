import React from 'react'
import ReactDOM from 'react-dom'
// import './app.css'
import Comp from './example.sfc'
const Index = () => {
  return (
    <div className="toplevel">
      {/* Hello React! */}
      <Comp />
    </div>
  )
}

ReactDOM.render(<Index />, document.getElementById('index'))
