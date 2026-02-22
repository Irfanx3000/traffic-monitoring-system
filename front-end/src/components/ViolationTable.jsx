// import React from "react";

// const API_BASE = "http://localhost:5000";

// export default function ViolationTable({ violations }) {
//   return (
//     <div className="table-container">
//       <table className="violation-table">
//         <thead>
//           <tr>
//             <th>Vehicle ID</th>
//             <th>Type</th>
//             <th>Speed</th>
//             <th>Limit</th>
//             <th>Over By</th>
//             <th>Time</th>
//             <th>Image</th>
//           </tr>
//         </thead>

//         <tbody>
//           {violations.map((v, index) => (
//             <tr key={index}>
//               <td>#{v.vehicle_id}</td>
//               <td>{v.vehicle_type}</td>
//               <td className="speed">{v.speed} mph</td>
//               <td>{v.speed_limit} mph</td>
//               <td className="over">
//                 +{(v.speed - v.speed_limit).toFixed(2)} mph
//               </td>
//               <td>{new Date(v.timestamp).toLocaleString()}</td>

//               <td>
//                 {v.image ? (
//                   <a
//                     href={`${API_BASE}/uploads/${v.image}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="view-btn"
//                   >
//                     View
//                   </a>
//                 ) : (
//                   "—"
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
