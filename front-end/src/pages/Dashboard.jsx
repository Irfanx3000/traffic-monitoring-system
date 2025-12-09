import React, { useContext } from "react";
import { DataContext } from "../layout/DataContext";

// Recharts
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

import { AlertTriangle, Activity, Shield, Car, Calendar } from "lucide-react";

// Colors for Pie Chart
const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function Dashboard() {
  const {
    statistics = {},
    dailyAnalytics = [],
    vehicleTypes = [],
    recentViolations = [],
  } = useContext(DataContext);

  return (
    <div className="dashboard-page">

      {/* =======================
          4 QUICK STAT CARDS
      =========================== */}
      <div className="stats-row">
        <div className="stat-card">
          <AlertTriangle size={32} />
          <p className="stat-title">Total Violations</p>
          <h2 className="stat-value">{statistics?.total_violations ?? "--"}</h2>
        </div>

        <div className="stat-card">
          <Activity size={32} />
          <p className="stat-title">Avg Speed</p>
          <h2 className="stat-value">
            {statistics?.average_speed ?? "--"} mph
          </h2>
        </div>

        <div className="stat-card">
          <Shield size={32} />
          <p className="stat-title">Emergency Vehicles</p>
          <h2 className="stat-value">
            {statistics?.emergency_vehicles ?? "--"}
          </h2>
        </div>

        <div className="stat-card">
          <Car size={32} />
          <p className="stat-title">Today's Detections</p>
          <h2 className="stat-value">
            {statistics?.recent_detections ?? "--"}
          </h2>
        </div>
      </div>

      {/* =======================
          VIOLATION TREND GRAPH
      =========================== */}
      <div className="chart-card-large">
        <div className="chart-header">
          <h2>Violations Trend</h2>
          <Calendar size={24} />
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="_id" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =======================
           THIRD ROW OF CARDS
      =========================== */}
      <div className="charts-row">

        {/* VEHICLE TYPE PIE CHART */}
        <div className="chart-card">
          <h2>Vehicle Type Distribution</h2>

          {vehicleTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={vehicleTypes}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ _id, percent }) =>
                    `${_id}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {vehicleTypes.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        {/* SPEED LIMIT GAUGE */}
        <div className="chart-card">
          <h2>Speed Limit Compliance</h2>
          <div className="gauge-wrapper">
            <svg viewBox="0 0 200 100">
              {/* Background arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#444"
                strokeWidth="16"
                fill="none"
              />

              {/* Progress Arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#ef4444"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(statistics?.violation_percentage || 0) *
                  5} 500`}
                strokeLinecap="round"
              />
            </svg>

            <div className="gauge-value">
              {statistics?.violation_percentage ?? 0}%
            </div>
          </div>
        </div>

        {/* LATEST DETECTION CARD */}
        <div className="chart-card">
          <h2>Latest Detection</h2>

          {recentViolations[0] ? (
            <div className="latest-detection">
              <p>
                <strong>Speed:</strong> {recentViolations[0].speed} mph
              </p>
              <p>
                <strong>Type:</strong> {recentViolations[0].vehicle_type}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(recentViolations[0].timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>No detections yet</p>
          )}
        </div>

      </div>
    </div>
  );
}
