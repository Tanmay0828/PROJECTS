import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const navigate = useNavigate();

  // Start Camera with Mic (No Speaker)
  const startCamera = async () => {
    try {
      if (!cameraActive) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: { echoCancellation: true, noiseSuppression: true } // ✅ Enable mic
        });

        // Disable speaker (mute video output)
        stream.getAudioTracks().forEach(track => {
          track.enabled = true;  // ✅ Mic ON
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // ✅ Mute speaker during live video
        }
        setCameraActive(true);
      } else {
        stopCamera();
      }
    } catch (err) {
      console.error("Camera/microphone access error:", err);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks (video + mic)
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  // Capture Image and Download (Only If Camera is Active)
  const captureImage = () => {
    if (!cameraActive || !canvasRef.current || !videoRef.current) return; // Restrict when camera is off

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "captured-image.png";
    link.click();
  };

  // Start Recording (with mic only, no speaker)
  const startRecording = () => {
    if (!cameraActive || !videoRef.current || !videoRef.current.srcObject) return; // Restrict when camera is off

    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;

    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      setVideoURL(videoUrl); // Store video URL for playback

      // ✅ Auto-download the recorded video
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "recorded-video.webm"; // Set filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      stopCamera(); // Stop camera after recording ends
    };

    mediaRecorder.start();
    setRecording(true);
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  // Go Back to Dashboard
  const goToDashboard = () => {
    stopCamera();
    navigate("/dashboard");
  };

  return (
    <div className="camera-container">
      <h2>Camera Access (Mic Only, No Speaker While Recording)</h2>
      <video ref={videoRef} autoPlay playsInline muted /> {/* ✅ Mute speaker */}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* ✅ Start/Stop Camera Toggle Button */}
      <button onClick={startCamera} style={{ background: cameraActive ? "red" : "green" }}>
        {cameraActive ? "Stop Camera" : "Start Camera"}
      </button>

      {/* ✅ Image Capture Button (Disabled When Camera is Off) */}
      <button onClick={captureImage} disabled={!cameraActive} style={{ opacity: cameraActive ? 1 : 0.5 }}>
        Capture Image
      </button>

      {recording ? (
        <button onClick={stopRecording} style={{ background: "red" }}>
          Stop Recording
        </button>
      ) : (
        <button onClick={startRecording} disabled={!cameraActive} style={{ background: "green", opacity: cameraActive ? 1 : 0.5 }}>
          Start Recording
        </button>
      )}

      {/* ✅ Video Playback (Enable Speaker Only While Watching) */}
      {videoURL && (
        <div>
          <h3>Recorded Video</h3>
          <video src={videoURL} controls autoPlay />
        </div>
      )}

      {/* ➡️ "Go Back to Dashboard" with Camera Stop */}
      <button onClick={goToDashboard} style={{ background: "#007bff", marginTop: "20px" }}>
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default Camera;
