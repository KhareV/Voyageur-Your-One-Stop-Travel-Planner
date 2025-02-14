import React from 'react'
import Card from './trip_card.jsx'
function card_container() {
    let styles={display:"flex"}
  return (
    <div style={styles}>
      <Card/>
      <Card/>
      <Card/>
      {/* <Card/> */}
    </div>
  )
}

export default card_container
