import React from "react";

export default function StatCard({ title, value, icon: Icon, color, borderColor }) {
  return (
    <div
      className="stat-card glass-card"
      style={{
        borderColor,
        boxShadow: `0 0 12px ${borderColor}`,
      }}
    >
      <div className="stat-icon-box" style={{ backgroundColor: color }}>
        <Icon size={26} color="#fff" />
      </div>

      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  );
}
