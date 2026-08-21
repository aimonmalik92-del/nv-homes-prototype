import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import BudgetCalculator from "./pages/BudgetCalculator";
import ProjectBudgetTracking from "./pages/ProjectBudgetTracking";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/budget-calculator" element={<BudgetCalculator />} />
      <Route path="/dashboard" element={<ProjectBudgetTracking />} />
    </Routes>
  );
}