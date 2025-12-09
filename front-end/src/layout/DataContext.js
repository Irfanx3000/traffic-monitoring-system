import { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

const API_BASE = "http://localhost:5000/api";

export function DataProvider({ children }) {
  const [statistics, setStatistics] = useState(null);
  const [violations, setViolations] = useState([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [stats, viols, emergency] = await Promise.all([
        fetch(`${API_BASE}/statistics`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/violations?limit=50`).then(r => r.json()).catch(() => ({ violations: [] })),
        fetch(`${API_BASE}/emergency-vehicles?limit=10`).then(r => r.json()).catch(() => []),
      ]);

      setStatistics(stats);
      setViolations(viols.violations || []);
      setEmergencyVehicles(emergency);
      
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  return (
    <DataContext.Provider value={{ statistics, violations, emergencyVehicles }}>
      {children}
    </DataContext.Provider>
  );
}
