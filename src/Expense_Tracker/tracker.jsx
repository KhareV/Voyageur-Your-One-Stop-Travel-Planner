import React from 'react'
import Item from './table.jsx'
import Head from './headline.jsx'
import Button from '@mui/material/Button';

function tracker() {
  let styles = { margin: "2rem" }
  let bstyle={display:"flex",justifyContent:"center",alignItems:"center"}
  return (
    <>
      <div style={styles}>
        <Head />
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
      <div style={bstyle}>
        <Button variant="outlined" color="error">
          Add more
        </Button>
      </div>
    </>
  )
}

export default tracker
