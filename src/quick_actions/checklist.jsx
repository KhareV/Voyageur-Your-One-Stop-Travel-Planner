import React from 'react'
import Item from './item.jsx'

function checklist() {
    let styles={width:"100%",display:"flex",flexWrap:"wrap",justifyContent:"space-around"}
  return (
    <div style={styles}>
      <Item/>
      <Item/>
      <Item/>
      <Item/>
      <Item/>
      <Item/>
    </div>
  )
}

export default checklist
