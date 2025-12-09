import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

export default function useFetchData() {
  const [statistics, setStatistics] = useState(null);
  const [violations, setViolations] = useState([]);
  const [dailyAnalytics, setDailyAnalytics] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [stats, viols, daily, types, emergency, recent] = await Promise.all([
        fetch(`${API_BASE}/statistics`).then((r) => r.json()),
        fetch(`${API_BASE}/violations?limit=50`).then((r) => r.json()),
        fetch(`${API_BASE}/analytics/daily?days=7`).then((r) => r.json()),
        fetch(`${API_BASE}/analytics/vehicle-types`).then((r) => r.json()),
        fetch(`${API_BASE}/emergency-vehicles?limit=10`).then((r) => r.json()),
        fetch(`${API_BASE}/violations/recent?limit=5`).then((r) => r.json()),
      ]);

      setStatistics(stats);
      setViolations(viols?.violations || []);
      setDailyAnalytics(daily);
      setVehicleTypes(types);
      setEmergencyVehicles(emergency);
      setRecentViolations(recent);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    statistics,
    violations,
    dailyAnalytics,
    vehicleTypes,
    emergencyVehicles,
    recentViolations,
    loading,
  };
}
