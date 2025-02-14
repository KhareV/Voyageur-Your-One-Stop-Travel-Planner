import React from 'react'

function nav_item({text}) {
    let astyle={textDecoration:"none" ,color:"black",fontSize:"1    rem"}
    let listyle={margin:"20px",listStyleType:"none"}
  return (
    <>
        <li style={listyle}><a href="/" let style={astyle}>{text}</a></li>
    </>
  )
}

export default nav_item
