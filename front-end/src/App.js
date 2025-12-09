import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DataProvider } from "./layout/DataContext";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Violations from "./pages/Violations";
import Emergency from "./pages/Emergency";

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route element={<MainLayout />}>
            
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/violations" element={<Violations />} />
            <Route path="/emergency" element={<Emergency />} />

          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
