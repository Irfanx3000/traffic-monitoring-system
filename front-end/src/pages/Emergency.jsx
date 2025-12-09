import React, { useContext } from "react";
import { DataContext } from "../layout/DataContext";
import { Shield } from "lucide-react";

export default function Emergency() {
  const data = useContext(DataContext);

  if (!data) return <p>Loading...</p>;

  const { emergencyVehicles } = data;

  return (
    <div className="emergency-content">

      {/* Header inside page (subtitle only) */}
      <div className="emergency-header">
        <h1 className="emergency-title">Emergency Vehicles</h1>
        <p className="emergency-sub">Exempted emergency detections</p>
      </div>

      {/* Emergency Cards Grid */}
      <div className="emergency-grid">
        {emergencyVehicles && emergencyVehicles.length > 0 ? (
          emergencyVehicles.map((ev, index) => (
            <div
              key={index}
              className="emergency-card glass-card"
              style={{
                borderColor: "rgba(0,255,120,0.45)",
                boxShadow: "0 0 12px rgba(0,255,120,0.35)",
              }}
            >
              <div className="emergency-card-header">
                <div className="emergency-icon-box">
                  <Shield size={30} color="#0f0" />
                </div>
                <span className="exempted-tag">EXEMPTED</span>
              </div>

              {/* Image */}
              {ev.image_filename ? (
                <div className="emergency-image-frame">
                  <img
                    src={`http://localhost:5000/api/emergency-images/${ev.image_filename}`}
                    alt="Emergency Vehicle"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              ) : (
                <div className="emergency-image-frame no-image">
                  <Shield size={50} color="rgba(255,255,255,0.3)" />
                </div>
              )}

              {/* Info */}
              <h2 className="emergency-type">{ev.vehicle_type}</h2>
              <p className="emergency-id">ID: #{ev.vehicle_id}</p>
              <p className="emergency-time small">
                {new Date(ev.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="no-emergency glass-card">
            <Shield size={70} color="rgba(255,255,255,0.3)" />
            <p>No emergency vehicles detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
