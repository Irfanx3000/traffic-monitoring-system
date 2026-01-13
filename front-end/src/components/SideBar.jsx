// src/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Activity, AlertTriangle, Shield } from "lucide-react";
import { UploadCloud } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      {/* =======================
          BRAND
      ======================= */}
      <div className="sidebar-header">
        <div className="logo">
          <AlertTriangle size={26} />
        </div>
        <div className="logo-text">
          <h1>TrafficWatch</h1>
          <p>Monitoring System</p>
        </div>
      </div>

      {/* =======================
          NAVIGATION
      ======================= */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          <Activity size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/violations"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active danger" : ""}`
          }
        >
          <AlertTriangle size={20} />
          <span>Violations</span>
        </NavLink>

        <NavLink
          to="/emergency"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active success" : ""}`
          }
        >
          <Shield size={20} />
          <span>Emergency</span>
        </NavLink>
        <NavLink to="/upload" className="nav-button">
        <UploadCloud size={20} />
        <span>Upload Video</span>
        </NavLink>
        </nav>
      {/* =======================
          FOOTER / USER
      ======================= */}
      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <p className="admin-name">Admin User</p>
            <p className="admin-role">Administrator</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
