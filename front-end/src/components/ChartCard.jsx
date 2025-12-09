import React from "react";

export default function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="chart-card glass-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        {Icon && <Icon size={22} color="#777" />}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  );
}
