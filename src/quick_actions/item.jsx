import React from 'react'

function item() {
    let divstyle={height:"300px",width:"300px" , border:"2px solid black",margin:"3rem"}
    let imgstyle={height:"230px",width:"250px"}
    let inputdivstyle={display:"flex",justifyContent:"space-around",margin:"30px",fontSize:"1rem"}
    let checkboxstyle={transform:"scale(2)"}
    let labelstyle={fontSize:"1.5rem"}
  return (
    <div style={divstyle}>
        <img  style={imgstyle} src="https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw11e7d01c/images/Titan/Catalog/1825SL15_2.jpg?sw=600&sh=600" alt="watch" />
        <hr />
        <div style={inputdivstyle}>
            <label htmlFor="check" style={labelstyle}>CheckBox:</label>
            <input id="check" type="checkbox" style={checkboxstyle}/>
        </div>
    </div>
  )
}

export default item
