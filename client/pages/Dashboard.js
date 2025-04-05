import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to the Dashboard</h2>

      <div className="button-container">
        <button onClick={() => navigate("/camera")} style={buttonStyle}>
          Access Camera
        </button>
        <button onClick={() => navigate("/Detection")} style={buttonStyle}>
          Go to Detection
        </button>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>
    </div>
  );
};

// Inline Styles
const buttonStyle = {
  background: "#007bff",
  color: "white",
  padding: "10px 15px",
  margin: "10px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
};

const logoutButtonStyle = {
  ...buttonStyle,
  background: "red",
};

export default Dashboard;
