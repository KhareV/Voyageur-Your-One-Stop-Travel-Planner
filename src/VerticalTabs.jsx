import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Header from './navigation_bar/header.jsx'
import Cards from './Upcoming_trips/card_container.jsx'
import Journal from './Recent_Journal/journal_card_list.jsx'
import Expense from './Expense_Tracker/tracker.jsx'
import CheckList from './quick_actions/checklist.jsx'
// import Nav_item from './navigation_bar/nav_item.jsx'
import Heading from './navheading.jsx'
import Navigation from './navigation_bar/navigation.jsx'
import Footer from './navigation_bar/footer.jsx'
import VoyageurProfile from './upcoming_gpt/Profile.jsx'
import FullPageVoyageurProfile from './upcoming_gpt/Profile2.jsx'
import Navbar from './upcoming_gpt/navbargpt.jsx'
import Ex from './VerticalTabs.jsx' 

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="My Profile" {...a11yProps(0)} />
          <Tab label="Upcoming Trips" {...a11yProps(1)} />
          <Tab label="Recent Jornals" {...a11yProps(2)} />
          <Tab label="Expense Tracker" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Heading title="My Profile"/>
      <FullPageVoyageurProfile/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Heading title="Upcoming Trips"/>
      <Cards/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
       <Heading title="Recent Journals"/>
      <Journal/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Heading title="Expense Tracker"/>
      <Expense/>
      </CustomTabPanel>
    </Box>
  );
}
