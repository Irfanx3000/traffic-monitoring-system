// import React, { useContext, useMemo } from "react";
// import { DataContext } from "../layout/DataContext";

// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// import {
//   AlertTriangle,
//   Activity,
//   Shield,
//   Car,
//   Calendar,
// } from "lucide-react";

// import "./Dashboard.css";

// const COLORS = ["#ef4444", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6"];
// const API_BASE = "http://localhost:5000";

// export default function Dashboard() {
//   const {
//     statistics = {},
//     dailyAnalytics = [],
//     vehicleTypes = [],
//     recentViolations = [],
//   } = useContext(DataContext);

//   const avgSpeed = statistics?.average_speed ?? 0;
//   const violationPercentage = Math.min(
//     statistics?.violation_percentage ?? 0,
//     100
//   );

//   const gaugeStroke = Math.min(violationPercentage * 4, 320);

//   const latest = useMemo(
//     () => (recentViolations.length ? recentViolations[0] : null),
//     [recentViolations]
//   );

//   const latestImage = latest?.image
//     ? `${API_BASE}/uploads/${latest.image}`
//     : null;

//   return (
//     <div className="dashboard-page dashboard-new">

//       {/* STATS */}
//       <div className="stats-row">
//         <Stat icon={<AlertTriangle />} title="Total Violations" value={statistics.total_violations ?? 0} />
//         <Stat icon={<Activity />} title="Avg Speed" value={`${avgSpeed.toFixed(1)} km/h`} />
//         <Stat icon={<Shield />} title="Emergency Vehicles" value={statistics.emergency_vehicles ?? 0} />
//         <Stat icon={<Car />} title="Today's Detections" value={statistics.recent_detections ?? 0} />
//       </div>

//       {/* TREND */}
//       <div className="glass-card dashboard-trend">
//         <div className="chart-header">
//           <h2 className="chart-title">Violations Trend</h2>
//           <Calendar size={18} />
//         </div>

//         {dailyAnalytics.length ? (
//           <ResponsiveContainer width="100%" height={260}>
//             <LineChart data={dailyAnalytics}>
//               <defs>
//                 <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
//                   <stop offset="0%" stopColor="#ef4444" />
//                   <stop offset="100%" stopColor="#f97316" />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
//               <XAxis dataKey="_id" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="count"
//                 stroke="url(#trendLine)"
//                 strokeWidth={4}
//                 dot={false}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="no-data">No trend data available</p>
//         )}
//       </div>

//       {/* LOWER GRID */}
//       <div className="charts-row">

//         <div className="glass-card dashboard-pie">
//           <h2 className="chart-title">Vehicle Type Distribution</h2>
//           {vehicleTypes.length ? (
//             <ResponsiveContainer width="100%" height={240}>
//               <PieChart>
//                 <Pie
//                   data={vehicleTypes}
//                   dataKey="count"
//                   nameKey="_id"
//                   innerRadius={55}
//                   outerRadius={90}
//                 >
//                   {vehicleTypes.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="no-data">No data</p>
//           )}
//         </div>

//         <div className="glass-card dashboard-gauge">
//           <h2 className="chart-title">Speed Compliance</h2>
//           <div className="gauge-wrapper">
//             <svg viewBox="0 0 200 100">
//               <circle cx="100" cy="100" r="80" />
//               <circle
//                 cx="100"
//                 cy="100"
//                 r="80"
//                 strokeDasharray={`${gaugeStroke} 500`}
//                 className="gauge-progress"
//               />
//             </svg>
//             <div className="gauge-value">{violationPercentage.toFixed(1)}%</div>
//           </div>
//         </div>

//         <div className="glass-card dashboard-latest">
//           <h2 className="chart-title">Latest Detection</h2>
//           {latest ? (
//             <>
//               {latestImage && (
//                 <img
//                   src={latestImage}
//                   alt="Latest"
//                   onError={(e) => (e.currentTarget.style.display = "none")}
//                 />
//               )}
//               <p><strong>Speed:</strong> {latest.speed} km/h</p>
//               <p><strong>Type:</strong> {latest.vehicle_type}</p>
//               <p><strong>Time:</strong> {new Date(latest.timestamp).toLocaleString()}</p>
//             </>
//           ) : (
//             <p className="no-data">No detection yet</p>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// function Stat({ icon, title, value }) {
//   return (
//     <div className="glass-card stat-card dashboard-stat">
//       {icon}
//       <p className="stat-title">{title}</p>
//       <h3 className="stat-value">{value}</h3>
//     </div>
//   );
// }
import React, { useContext, useMemo } from "react";
import { DataContext } from "../layout/DataContext";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  AlertTriangle,
  Activity,
  Shield,
  Car,
  Calendar,
} from "lucide-react";

import "./Dashboard.css";

const API_BASE = "http://localhost:5000";

/* ✅ STABLE COLOR MAPPING (VERY IMPORTANT) */
const VEHICLE_COLORS = {
  car: "#3b82f6",          // blue
  truck: "#f97316",        // orange
  bus: "#22c55e",          // green
  motorcycle: "#8b5cf6",   // purple
  emergency: "#ef4444",    // red
};

export default function Dashboard() {
  const {
    statistics = {},
    dailyAnalytics = [],
    vehicleTypes = [],
    recentViolations = [],
  } = useContext(DataContext);

  const avgSpeed = statistics.average_speed ?? 0;
  const violationPercentage = Math.min(
    statistics.violation_percentage ?? 0,
    100
  );

  const latest = useMemo(
    () => (recentViolations.length ? recentViolations[0] : null),
    [recentViolations]
  );

  const latestImage = latest?.image
    ? `${API_BASE}/uploads/${latest.image}`
    : null;

  return (
    <div className="dashboard-container">

      {/* ================= KPIs ================= */}
      <div className="kpi-grid">
        <Kpi
          icon={<AlertTriangle />}
          label="Total Violations"
          value={statistics.total_violations ?? 0}
        />
        <Kpi
          icon={<Activity />}
          label="Avg Speed"
          value={`${avgSpeed.toFixed(1)} km/h`}
        />
        <Kpi
          icon={<Shield />}
          label="Emergency Vehicles"
          value={statistics.emergency_vehicles ?? 0}
        />
        <Kpi
          icon={<Car />}
          label="Today's Detections"
          value={statistics.recent_detections ?? 0}
        />
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="analytics-grid">

        {/* Violations Trend */}
        <div className="card large">
          <div className="card-header">
            <h3>Violations Trend</h3>
            <Calendar size={18} />
          </div>

          {dailyAnalytics.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty">No trend data</p>
          )}
        </div>

        {/* Vehicle Distribution */}
        <div className="card">
          <h3>Vehicle Distribution</h3>
          {vehicleTypes.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={vehicleTypes}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={60}
                  outerRadius={95}
                >
                  {vehicleTypes.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={VEHICLE_COLORS[entry._id] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty">No data</p>
          )}
        </div>
      </div>

      {/* ================= MONITORING ================= */}
      <div className="monitoring-grid">

        {/* Speed Compliance */}
        <div className="card">
          <h3>Speed Compliance</h3>
          <div className="gauge">
            <svg viewBox="0 0 200 100">
              <path
                d="M20 100 A80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <path
                d="M20 100 A80 80 0 0 1 180 100"
                fill="none"
                stroke="#22c55e"
                strokeWidth="12"
                strokeDasharray={`${violationPercentage * 2.5} 250`}
              />
            </svg>
            <span className="gauge-value">
              {violationPercentage.toFixed(1)}%
            </span>
            <p className="gauge-label">Vehicles within speed limit</p>
          </div>
        </div>

        {/* Latest Detection */}
        <div className="card">
          <h3>Latest Detection</h3>
          {latest ? (
            <>
              {latestImage && (
                <img
                  src={latestImage}
                  alt="latest detection"
                  className="latest-image"
                />
              )}
              <p><strong>Type:</strong> {latest.vehicle_type}</p>
              <p><strong>Speed:</strong> {latest.speed} km/h</p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(latest.timestamp).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="empty">No detection yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= KPI CARD ================= */
function Kpi({ icon, label, value }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <p className="kpi-label">{label}</p>
      <h2 className="kpi-value">{value}</h2>
    </div>
  );
}
