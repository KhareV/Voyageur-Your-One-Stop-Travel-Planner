import React from 'react'

function trip_card({ dest = "Paris", date = "01/01/2025", name = "Trip", st = "upcoming" }) {
  // let cardstyle = { height: "460px", width: "300px", borderRadius: "5px", color: "black", textAlign: "center", margin: "2rem", transition: "transform 0.3s ease, box-shadow 0.3s ease", transform: "perspective(1000px) translateZ(0)" }
  let hstyle = { padding: "10px" }
  let btnstyle = { padding: "0.5rem", margin: "0.5rem 0rem", backgroundColor: "red", color: "white", fontSize: "15px", borderRadius: "0.5rem" }
  let imgstyle = { height: "50%", width: "100%", borderRadius: "8px 8px 0px 0px" }
  return (
    <>
      <style>{`
    .pop-out-card {
            background: white;
            margin: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            transform: perspective(1000px) translateZ(0);
            text-align:center;
            // display:flex;
            // flex-direction:column;
          }

    .pop-out-card:hover {
            transform: perspective(1000px) translateZ(20px) scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
          .btn:hover{
                background-color:blue;
                color:black;
            }
          `
      }
      </style>
      <div className="pop-out-card">
        <img style={imgstyle} src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg" alt="image" />
        <h2 style={hstyle}>{name}</h2>
        <p style={hstyle}><i className="fa-solid fa-calendar-days"></i>&nbsp;{date}</p>
        <h2 style={hstyle}><i className="fa-solid fa-location-dot"></i>&nbsp;{dest}</h2>
        <p><b><u>Status</u>: </b>{st}</p>
        <button style={btnstyle} className="btn">Modify trip details!</button>
      </div>
    </>
  )
}

export default trip_card
