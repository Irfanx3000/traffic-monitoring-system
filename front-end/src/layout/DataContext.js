import { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

const API_BASE = "http://localhost:5000/api";

// ==============================
// DEFAULT SHAPES (CRITICAL)
// ==============================
const DEFAULT_STATISTICS = {
  total_violations: 0,
  total_vehicles: 0,
  recent_detections: 0,
  emergency_vehicles: 0,
  average_speed: 0,
  violation_percentage: 0,
};

export function DataProvider({ children }) {
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);
  const [violations, setViolations] = useState([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState([]);
  const [dailyAnalytics, setDailyAnalytics] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAllData() {
    try {
      const [
        statsRes,
        violsRes,
        emergencyRes,
        dailyRes,
        vehicleTypeRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/statistics`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/violations?limit=50`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/emergency-vehicles?limit=10`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/analytics/daily`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/analytics/vehicle-types`).then(r => r.json()).catch(() => []),
      ]);

      // ==============================
      // STATISTICS
      // ==============================
      setStatistics({
        total_violations: statsRes?.total_violations ?? 0,
        total_vehicles: statsRes?.total_vehicles ?? 0,
        recent_detections: statsRes?.recent_detections ?? 0,
        emergency_vehicles: statsRes?.emergency_vehicles ?? 0,
        average_speed: statsRes?.average_speed ?? 0,
        violation_percentage: statsRes?.violation_percentage ?? 0,
      });

      // ==============================
      // VIOLATIONS
      // ==============================
      setViolations(
        Array.isArray(violsRes?.violations) ? violsRes.violations : []
      );

      // ==============================
      // EMERGENCY VEHICLES
      // ==============================
      setEmergencyVehicles(
        Array.isArray(emergencyRes) ? emergencyRes : []
      );

      // ==============================
      // DAILY ANALYTICS
      // ==============================
      setDailyAnalytics(
        Array.isArray(dailyRes) ? dailyRes : []
      );

      // ==============================
      // VEHICLE TYPES
      // ==============================
      setVehicleTypes(
        Array.isArray(vehicleTypeRes) ? vehicleTypeRes : []
      );

    } catch (err) {
      console.error("❌ Data fetch error:", err);
    }
  }

  return (
    <DataContext.Provider
      value={{
        statistics,
        violations,
        emergencyVehicles,
        dailyAnalytics,
        vehicleTypes,
        recentViolations: violations.slice(0, 5),
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
