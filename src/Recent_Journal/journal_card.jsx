import React from 'react'

function journal_card({ dest = "Paris", date = "01/01/2025", name = "Trip" }) {
    let cardstyle = { height: "53   0px", width: "500px", border: "2px solid red", borderRadius: "12px", color: "black", textAlign: "center", margin: "3rem" }
    let hstyle = { padding: "10px" }
    let btnstyle = { padding: "0.5rem", margin: "0.5rem 0rem", backgroundColor: "red    ", color: "white", borderRadius: "0.5rem" }
    let pstyle = { margin: "15px" }
    let astyle={color:"blue",padding:"15px 0px"}
    return (
        <>
            <style>
                {`
                .pop-out-card{
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    transform: perspective(1000px) translateZ(0);
                }
                .pop-out-card:hover{
                    transform: perspective(1000px) translateZ(20px) scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
            `}
            </style>
            <div style={cardstyle} className="pop-out-card">
                <h2 style={hstyle}>{name}</h2>
                <p style={hstyle}>{date}</p>
                <hr />
                <p style={pstyle}>Lorem, ipsum dolor Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi vitae, reiciendis dolores vel quos totam, odit quisquam a accusamus, quod nihil repellat adipisci ducimus. Consectetur unde voluptatem voluptates explicabo facilis! sit amet consectetur adipisicing elit. Atque, veritatis architecto saepe voluptatibus fugit illo iste, pariatur fugiat repudiandae fuga dolor ducimus unde. Quos esse quam, asperiores obcaecati temporibus architecto corporis possimus, iure, eveniet accusamus voluptatem quo alias! Tempora, earum!</p>
                <a href="/" style={astyle}><u>read more</u></a>
                {/* <hr /> */}
                <h2 style={hstyle}>{dest}</h2>
                <button style={btnstyle}>Modify Journal!</button>
            </div>
        </>
    )
}

export default journal_card


// import React from 'react';

// function JournalCard({ dest = "Paris", date = "01/01/2025", name = "Trip" }) {
//     return (
//         <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 p-6">
//             <h2 className="text-2xl font-semibold text-gray-900 text-center">{name}</h2>
//             <p className="text-gray-600 text-center mt-1">{date}</p>
//             <p className="text-gray-700 text-sm mt-4 leading-relaxed">
//                 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi vitae, reiciendis dolores vel quos totam, odit quisquam a accusamus, quod nihil repellat adipisci ducimus.
//             </p>
//             <div className="mt-4 flex justify-center">
//                 <a href="/" className="text-blue-600 hover:underline">See more</a>
//             </div>
//             <h2 className="text-xl font-medium text-gray-800 text-center mt-4">{dest}</h2>
//             <div className="mt-4 flex justify-center">
//                 <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow">Modify Journal!</button>
//             </div>
//         </div>
//     );
// }

// export default JournalCard;
