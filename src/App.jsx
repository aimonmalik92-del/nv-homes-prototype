import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import BudgetCalculator from "./pages/BudgetCalculator";
import ProjectBudgetTracking from "./pages/ProjectBudgetTracking";
import BudgetTracking from "./pages/BudgetTracking";
import QualityChecklists from "./pages/QualityChecklists";
import ChecklistDetail from "./pages/ChecklistDetail";
import Timeline from "./pages/Timeline";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/budget-calculator" element={<BudgetCalculator />} />
      <Route path="/dashboard" element={<ProjectBudgetTracking />} />
      <Route path="/budget" element={<BudgetTracking />} />
      <Route path="/checklists" element={<QualityChecklists />} />
      <Route path="/checklists/:no" element={<ChecklistDetail />} />
      <Route path="/timeline" element={<Timeline />} />
    </Routes>
  );
}
