// import React, { useContext, useState } from "react";
// import { DataContext } from "../layout/DataContext";
// import { Search } from "lucide-react";
// import { motion } from "framer-motion";

// export default function Violations() {
//   const data = useContext(DataContext);
//   const [searchTerm, setSearchTerm] = useState("");

//   if (!data) return <p>Loading...</p>;

//   const { violations } = data;

//   const filteredViolations = violations.filter((v) =>
//     v.vehicle_id.toString().includes(searchTerm)
//   );

//   return (
//     <motion.div
//       className="violations-content"
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//     >
//       {/* Header */}
//       <div className="violations-header">
//         <div>
//           <h1 className="vio-title">Violations</h1>
//           <p className="subtitle">All recorded traffic violations</p>
//         </div>

//         {/* Search Box */}
//         <div className="search-box glass-card">
//           <Search size={20} color="#fff" />
//           <input
//             type="text"
//             placeholder="Search by Vehicle ID..."
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="violations-table glass-card">
//         <table>
//           <thead>
//             <tr>
//               <th>Vehicle ID</th>
//               <th>Type</th>
//               <th>Speed</th>
//               <th>Limit</th>
//               <th>Over By</th>
//               <th>Time</th>
//               <th>Image</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredViolations.length > 0 ? (
//               filteredViolations.map((v, index) => {
//                 // ✅ FIX: Use correct field & route
//                 const imageUrl = v.image
//                   ? `http://localhost:5000/uploads/${v.image}`
//                   : null;

//                 return (
//                   <tr key={index}>
//                     <td>#{v.vehicle_id}</td>

//                     <td>
//                       <span className="tag">{v.vehicle_type}</span>
//                     </td>

//                     <td className="red">{v.speed} km/h</td>

//                     <td>{v.speed_limit} km/h</td>

//                     <td className="yellow">
//                       +{v.over_speed_by?.toFixed?.(2) ?? v.over_speed_by} km/h
//                     </td>

//                     <td>{new Date(v.timestamp).toLocaleString()}</td>

//                     <td>
//                       {imageUrl ? (
//                         <button
//                           className="view-btn"
//                           onClick={() => window.open(imageUrl, "_blank")}
//                         >
//                           View
//                         </button>
//                       ) : (
//                         "—"
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
//                   No violations found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </motion.div>
//   );
// }
import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../layout/DataContext";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://localhost:5000";

export default function Violations() {
  const data = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

const violations = data?.violations || [];

  /* ---------------- FILTER ---------------- */
  const filteredViolations = useMemo(() => {
    return violations.filter((v) =>
      v.vehicle_id.toString().includes(searchTerm)
    );
  }, [violations, searchTerm]);

  /* ---------------- STATS ---------------- */
  const total = violations.length;
  const cars = violations.filter(v => v.vehicle_type === "car").length;
  const bikes = violations.filter(v => v.vehicle_type === "bike").length;
  const highSpeed = violations.filter(v => v.over_speed_by > 20).length;

  return (
    <motion.div
      className="violations-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ================= HEADER ================= */}
      <div className="violations-header">

        <div className="header-left">
          <h1 className="vio-title">Traffic Violations</h1>
        </div>

        {/* SEARCH */}
        <div className="search-box glass-card">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Vehicle ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="vio-stats">

        <div className="stat-card glass-card">
          <h3>{total}</h3>
          <p>Total Violations</p>
        </div>

        <div className="stat-card glass-card">
          <h3>{cars}</h3>
          <p>Cars</p>
        </div>

        <div className="stat-card glass-card">
          <h3>{bikes}</h3>
          <p>Bikes</p>
        </div>

        <div className="stat-card glass-card danger">
          <h3>{highSpeed}</h3>
          <p>High Speed Cases</p>
        </div>

      </div>

      {/* ================= TABLE ================= */}
      <div className="violations-table glass-card">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Speed</th>
              <th>Limit</th>
              <th>Overspeed</th>
              <th>Time</th>
              <th>Evidence</th>
            </tr>
          </thead>

          <tbody>
            {filteredViolations.length > 0 ? (
              filteredViolations.map((v, index) => {

                const imageUrl = v.image
                  ? `${API_BASE}/uploads/${v.image}`
                  : null;

                return (
                  <tr className="vio-row" key={index}>

                    <td className="vehicle-id">
                      #{v.vehicle_id}
                    </td>

                    <td>
                      <span className={`tag ${v.vehicle_type}`}>
                        {v.vehicle_type}
                      </span>
                    </td>

                    <td className="speed red">
                      {v.speed} km/h
                    </td>

                    <td className="limit">
                      {v.speed_limit} km/h
                    </td>

                    <td className={
                      v.over_speed_by > 20
                        ? "overspeed-high"
                        : "overspeed-low"
                    }>
                      +{Number(v.over_speed_by).toFixed(2)} km/h
                    </td>

                    <td className="time">
                      {new Date(v.timestamp).toLocaleString()}
                    </td>

                    <td>
                      {imageUrl ? (
                        <button
                          className="view-btn"
                          onClick={() => setSelectedImage(imageUrl)}
                        >
                          View
                        </button>
                      ) : "—"}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty">
                  No violations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= IMAGE MODAL ================= */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={selectedImage}
              alt="Violation Evidence"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}