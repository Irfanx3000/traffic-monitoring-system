import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function EmergencyCard({ item, API_BASE }) {
  // ✅ Build image URL safely
  const imageUrl = item?.image
    ? `http://localhost:5000/uploads/${item.image}`
    : null;

  return (
    <motion.div
      className="emergency-card glass-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="emergency-card-header">
        <div className="emergency-icon">
          <Shield size={28} color="#0f9" />
        </div>
        <span className="exempted-badge">EXEMPTED</span>
      </div>

      {/* ✅ IMAGE (FIXED, SAME UI) */}
      {imageUrl ? (
        <div className="emergency-image-container">
          <img
            src={imageUrl}
            className="emergency-vehicle-image"
            alt="Emergency Vehicle"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="emergency-image-container no-image">
          <span>No Image</span>
        </div>
      )}

      <h3 className="emergency-type">{item.vehicle_type}</h3>
      <p className="emergency-id">ID: #{item.vehicle_id}</p>
      <p className="emergency-time">
        {new Date(item.timestamp).toLocaleString()}
      </p>
    </motion.div>
  );
}
