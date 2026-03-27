import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import Interview from "./pages/Interview";
import CaseDetails from "./pages/CaseDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-case" element={<NewCase />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/case/:id" element={<CaseDetails />} />
    </Routes>
  );
}