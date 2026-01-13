import React, { useEffect, useState } from "react";
import EmergencyCard from "../components/EmergencyCard";

const API_BASE = "http://localhost:5000";

export default function Emergency() {
  const [emergencyVehicles, setEmergencyVehicles] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/emergency-vehicles`)
      .then((res) => res.json())
      .then((data) => setEmergencyVehicles(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="emergency-page">
      <h2>Emergency Vehicles</h2>

      <div className="emergency-grid">
        {emergencyVehicles.map((item, index) => (
          <EmergencyCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
