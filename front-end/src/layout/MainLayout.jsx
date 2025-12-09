import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/SideBar";
import TopBar from "../components/TopBar";

export default function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
