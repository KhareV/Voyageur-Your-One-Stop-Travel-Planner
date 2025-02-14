import React from 'react'

function table({dest="Paris",date="01/01/2025",gallery="check_here",expenses="0.00"}) {
      let mainstyle={display:"flex",justifyContent:"space-around",fontSize:"1.25rem",backgroundColor:"#e6c8d0",border:"2px solid black",margin:"2px 12px"}
      let divstyle={padding:"10px"}
  return (
      <>
      <style>
                {`
                .pop-out-card{
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    transform: perspective(1000px) translateZ(0);
                }
                .pop-out-card:hover{
                    transform: perspective(1000px) translateZ(2px) scale(1.01);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
            `}
            </style>
    <div style={mainstyle} className="pop-out-card">
      <div className="dest" style={divstyle}>
            {dest}
      </div>
      <div className="date" style={divstyle}>
            {date}
      </div>
      <div className="gallery" style={divstyle}>
            {gallery}
      </div>
      <div className="expenses" style={divstyle}>
            &#8377; {expenses}
      </div>

    </div>
    </>
  )
}

export default table
