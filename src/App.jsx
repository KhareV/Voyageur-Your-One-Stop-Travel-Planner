import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './navigation_bar/header.jsx'
import Cards from './Upcoming_trips/card_container.jsx'
import Journal from './Recent_Journal/journal_card_list.jsx'
import Expense from './Expense_Tracker/tracker.jsx'
import CheckList from './quick_actions/checklist.jsx'
import Dashboard from './dashboard.jsx'
import Navbar from './Navigation.jsx'  
import Footer from './navigation_bar/footer.jsx'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>  
    
      {/* <Header/>  */}
      {/* <Dashboard/> */}
        <Navbar/>
        {/* <Footer/> */}
    </>
  )
}

export default App
