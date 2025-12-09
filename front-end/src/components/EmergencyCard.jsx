import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function EmergencyCard({ item, API_BASE }) {
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

      {item.image_filename && (
        <div className="emergency-image-container">
          <img
            src={`${API_BASE}/emergency-images/${item.image_filename}`}
            className="emergency-vehicle-image"
            alt="Emergency Vehicle"
          />
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
