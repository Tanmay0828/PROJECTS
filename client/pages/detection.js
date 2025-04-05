import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FaceDetection = () => {
  const [stream, setStream] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const navigate = useNavigate();

  const startFaceDetection = async () => {
    if (!isDetecting) {
      setStream(null); // Reset old stream before starting again
      setIsDetecting(true);
      
      setTimeout(() => {
        setStream(`http://127.0.0.1:5001/video_feed?t=${Date.now()}`);
      }, 500); // Short delay ensures proper restart
    } else {
      await stopFaceDetection();
    }
  };

  const stopFaceDetection = async () => {
    setIsDetecting(false);
    setStream(null);

    try {
      await fetch("http://127.0.0.1:5001/stop", { method: "POST" });
    } catch (error) {
      console.error("Error stopping detection:", error);
    }
  };

  return (
    <div>
      <h2>Face Detection</h2>
      <button onClick={startFaceDetection} style={{ background: isDetecting ? "red" : "green" }}>
        {isDetecting ? "Stop Detection" : "Start Detection"}
      </button>

      {stream && (
        <img
          src={stream}
          alt="Face Detection Stream"
          style={{ width: "100%", maxWidth: "600px", marginTop: "10px" }}
        />
      )}

      <button onClick={() => navigate("/dashboard")} style={{ background: "#007bff", marginTop: "10px" }}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default FaceDetection;
