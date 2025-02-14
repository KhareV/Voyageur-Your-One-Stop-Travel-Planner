import React from 'react'

function navheading({title="hello"}) {
    let hstyle={padding:"2rem 0rem 0rem 1rem",color:"red",textAlign:"center",fontSize:"2rem",fontWeight:"bold"}
  return (
    <>
      <h2 style={hstyle}>{title}</h2>
    </>
  )
}

export default navheading
