import React from "react";
import { NavLink } from "react-router-dom";
import { Activity, AlertTriangle, Shield } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="sidebar">
      
      <div className="sidebar-header">
        <div className="logo">
          <AlertTriangle size={28} color="#fff" />
        </div>
        <div className="logo-text">
          <h1>TrafficWatch</h1>
          <p>Monitoring System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-button">
          <Activity size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/violations" className="nav-button">
          <AlertTriangle size={20} />
          <span>Violations</span>
        </NavLink>

        <NavLink to="/emergency" className="nav-button">
          <Shield size={20} />
          <span>Emergency</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <p className="admin-name">Admin User</p>
            <p className="admin-role">Administrator</p>
          </div>
        </div>
      </div>

    </div>
  );
}
