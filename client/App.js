import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Camera from "./pages/camera";  // Ensure correct capitalization
import Detection from "./pages/detection";  // Import the Detection component
import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/detection" element={<Detection />} /> {/* ✅ New Detection Route */}
      </Routes>
    </Router>
  );
}

export default App;
