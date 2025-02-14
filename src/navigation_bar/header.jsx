import React from 'react'
import Nav from './nav.jsx'

function header() {
  let headerstyle = { backgroundColor: "red", color: "whites", height: "60px", border: "5px", borderRadius: "5px 5px 0px 0px" }
  let pheaderstyle = { fontSize: "2rem  ", color: "white", paddingLeft: "2%", paddingTop: "1rem" }
  return (
    <>
      <div style={headerstyle}>
        <p style={pheaderstyle}>Welcome Pulkit</p>
      </div>
      {/* <Nav/> */}
      
    </>
  )
}

export default header
