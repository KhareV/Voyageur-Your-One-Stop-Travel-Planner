import React from 'react'
import Card from './journal_card.jsx'

function journal_card_list() {
    let styles={display:"flex"}
  return (
    <div style={styles}>
        <Card/>
        <Card/>
        <Card/>
    </div>
  )
}

export default journal_card_list