// src/components/TopBar.jsx

import React from "react";
import { Bell, Settings } from "lucide-react";

export default function TopBar() {
  return (
    <div
      style={{
        width: "100%",
        height: "85px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        // Spacing & alignment
        marginTop: "10px",
        marginBottom: "30px",
        padding: "0 32px",

        // Glassmorphism
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.35)",

        // Prevent overlap
        position: "relative",
        zIndex: 50,
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#fff",
          letterSpacing: "0.5px",
        }}
      >
        Traffic Control Center
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Bell Button */}
        <button
          style={{
            width: "46px",
            height: "46px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          <Bell size={20} color="#fff" />
        </button>

        {/* Settings Button */}
        <button
          style={{
            width: "46px",
            height: "46px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          <Settings size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}
