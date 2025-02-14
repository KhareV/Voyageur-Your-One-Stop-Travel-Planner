import React from 'react'
import Nav_item from './nav_item.jsx'
function nav() {
  let ulstyle={paddingTop:"40px"}
  return (
    <div>
      <ul style={ulstyle}>
        <Nav_item text="Upcoming trips"/>
        <Nav_item text="Recent Journal Entries"/>
        <Nav_item text="Travel budget &amp; Expense Tracker"/>
        <Nav_item text="Route Planner &amp; Navigation" />
        <Nav_item text="Quick Actions &amp; Shortcuts" />
        <Nav_item text="Personalized Recommendations" />
        <Nav_item text="Social &amp; Community Features "/>
        <Nav_item text="Settings and Customizations" />
      </ul>
    </div>
  )
}

export default nav
