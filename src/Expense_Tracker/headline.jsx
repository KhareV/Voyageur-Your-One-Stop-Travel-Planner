import React from 'react'

function table() {
      let mainstyle={display:"flex",justifyContent:"space-around",backgroundColor:"#d0f5c9",margin:"2px 12px"}
      let divstyle={padding:"10px"}
    //   let hstyle={backgroundColor:"#82db70"}
  return (
    <div style={mainstyle}>
      <div className="dest" style={divstyle}>
            <h2>Destination</h2>
      </div>
      <div className="date" style={divstyle}>
            <h2>Date</h2>
      </div>
      <div className="gallery" style={divstyle}>
            <h2>Gallery</h2>
      </div>
      <div className="expenses" style={divstyle}>
            <h2>Expenses</h2>
      </div>

    </div>
  )
}

export default table
