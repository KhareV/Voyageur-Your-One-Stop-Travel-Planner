import React from 'react'
import Header from './navigation_bar/header.jsx'
import Cards from './Upcoming_trips/card_container.jsx'
import Journal from './Recent_Journal/journal_card_list.jsx'
import Expense from './Expense_Tracker/tracker.jsx'
// import CheckList from './quick_actions/checklist.jsx'
// import Nav_item from './navigation_bar/nav_item.jsx'
import Heading from './navheading.jsx'
import AirbnbNavbar from './navigation_bar/navigation.jsx'
import Footer from './navigation_bar/footer.jsx'
// import VoyageurProfile from './upcoming_gpt/Profile.jsx'
// import FullPageVoyageurProfile from './upcoming_gpt/Profile2.jsx'
// import Air from './upcoming_gpt/navbargpt.jsx'
// import Ex from './VerticalTabs.jsx' 

function dashboard() {
  let styles={paddingTop:"2rem"}
  return (
      <>  
      {/* <AirbnbNavbar/> */}
      {/* <Header></Header> */}
      <div>
      {/* <Navbar/> */}
      {/* <Ex/> */}
      </div>
      
      {/* <div className="flex justify-center">
        <VoyageurProfile/>
      </div> */}
      {/* <Heading title="My Profile"/>
      <FullPageVoyageurProfile/>
      <Nav_item text="Upcoming trips"/> */}
      <Heading title="Upcoming Trips"/>
      <Cards/>
      <Heading title="Recent Journals"/>
      <Journal/>
      <Heading title="Expense Tracker"/>
      <Expense/>
      {/* <Heading title="Quick Actions and Shortcuts"/>
      <CheckList/> */}
      <div style={styles}>

      <Footer/>
      </div>
    </>
  )
}

export default dashboard
