// import React, { useEffect, useState } from "react";
// import EmergencyCard from "../components/EmergencyCard";

// const API_BASE = "http://localhost:5000";

// export default function Emergency() {
//   const [emergencyVehicles, setEmergencyVehicles] = useState([]);

//   useEffect(() => {
//     fetch(`${API_BASE}/api/emergency-vehicles`)
//       .then((res) => res.json())
//       .then((data) => setEmergencyVehicles(data))
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="emergency-page">
//       <h2>Emergency Vehicles</h2>

//       <div className="emergency-grid">
//         {emergencyVehicles.map((item, index) => (
//           <EmergencyCard key={index} item={item} />
//         ))}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import EmergencyCard from "../components/EmergencyCard";

const API_BASE = "http://localhost:5000";

export default function Emergency() {

  const [emergencyVehicles, setEmergencyVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH FROM BACKEND ---------- */
  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/emergency-vehicles`);
        const data = await res.json();

        // newest first (important for dashboard feel)
        setEmergencyVehicles(data.reverse());
      } catch (err) {
        console.error("Failed to fetch emergency vehicles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergency();

    // optional: auto refresh every 5 sec (live system feel)
    const interval = setInterval(fetchEmergency, 5000);
    return () => clearInterval(interval);

  }, []);

  /* ---------- UI ---------- */
  return (
    <div className="emergency-page">

      <div className="emergency-top">
        <h1>Emergency Vehicles</h1>
        <p>Vehicles exempted from traffic rules</p>
      </div>

      {loading ? (
        <div className="no-emergency">Loading detections...</div>
      ) : (
        <div className="emergency-grid">

          {emergencyVehicles.length > 0 ? (
            emergencyVehicles.map((item, i) => (
              <EmergencyCard key={i} item={item} />
            ))
          ) : (
            <div className="no-emergency">
              No emergency vehicles detected yet
            </div>
          )}

        </div>
      )}
    </div>
  );
}