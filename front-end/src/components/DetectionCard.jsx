import React from "react";
import { Car } from "lucide-react";

export default function DetectionCard({ recent }) {
  return (
    <div className="detection-card glass-card">
      <h2 className="chart-title">Latest Detection</h2>

      {!recent ? (
        <div className="no-detection">
          <Car size={60} color="rgba(255,255,255,0.4)" />
          <p>No violations detected</p>
        </div>
      ) : (
        <div className="detection-content">
          <div className="detection-preview">
            <Car size={70} color="#fff" />
          </div>

          <div className="detection-info">
            <div className="detect-row">
              <span className="detect-label">Speed</span>
              <span className="detect-value red">{recent.speed} km/h</span>
            </div>

            <div className="detect-row">
              <span className="detect-label">Type</span>
              <span className="detect-value">{recent.vehicle_type}</span>
            </div>

            <div className="detect-row">
              <span className="detect-label">Time</span>
              <span className="detect-value small">
                {new Date(recent.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
