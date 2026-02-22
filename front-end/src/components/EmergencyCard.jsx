// import { Shield } from "lucide-react";
// import { motion } from "framer-motion";

// export default function EmergencyCard({ item, API_BASE }) {
//   // ✅ Build image URL safely
//   const imageUrl = item?.image
//     ? `http://localhost:5000/uploads/${item.image}`
//     : null;

//   return (
//     <motion.div
//       className="emergency-card glass-card"
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35 }}
//     >
//       <div className="emergency-card-header">
//         <div className="emergency-icon">
//           <Shield size={28} color="#0f9" />
//         </div>
//         <span className="exempted-badge">EXEMPTED</span>
//       </div>

//       {/* ✅ IMAGE (FIXED, SAME UI) */}
//       {imageUrl ? (
//         <div className="emergency-image-container">
//           <img
//             src={imageUrl}
//             className="emergency-vehicle-image"
//             alt="Emergency Vehicle"
//             onError={(e) => {
//               e.currentTarget.style.display = "none";
//             }}
//           />
//         </div>
//       ) : (
//         <div className="emergency-image-container no-image">
//           <span>No Image</span>
//         </div>
//       )}

//       <h3 className="emergency-type">{item.vehicle_type}</h3>
//       <p className="emergency-id">ID: #{item.vehicle_id}</p>
//       <p className="emergency-time">
//         {new Date(item.timestamp).toLocaleString()}
//       </p>
//     </motion.div>
//   );
// }
import { Shield, ImageOff, Clock, Hash } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:5000";

export default function EmergencyCard({ item }) {

  // safe image url
  const imageUrl = item?.image
    ? `${API_BASE}/uploads/${item.image}`
    : null;

  return (
    <motion.div
      className="emergency-card glass-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >

      {/* HEADER */}
      <div className="emergency-header">

        <div className="emergency-left">
          <div className="emergency-icon">
            <Shield size={20} />
          </div>

          <div>
            <h3 className="emergency-title">Emergency Vehicle</h3>
            <span className="emergency-type">
              {item?.vehicle_type || "Unknown"}
            </span>
          </div>
        </div>

        <span className="exempted-badge">EXEMPTED</span>
      </div>


      {/* IMAGE */}
      <div className="emergency-image-wrapper">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Emergency Vehicle"
            className="emergency-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "";
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="no-image">
            <ImageOff size={40} />
            <p>No Evidence</p>
          </div>
        )}

      </div>


      {/* INFO */}
      <div className="emergency-info">

        <div className="info-row">
          <Hash size={15} />
          <span>#{item?.vehicle_id ?? "N/A"}</span>
        </div>

        <div className="info-row">
          <Clock size={15} />
          <span>
            {item?.timestamp
              ? new Date(item.timestamp).toLocaleString()
              : "Unknown time"}
          </span>
        </div>

      </div>

    </motion.div>
  );
}