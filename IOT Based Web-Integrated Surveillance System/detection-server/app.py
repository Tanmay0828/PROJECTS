from flask import Flask, Response, request
import cv2
import os
import time
from datetime import datetime
from ultralytics import YOLO

app = Flask(__name__)

# Load Haar Cascades for face & body detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_fullbody.xml")

# Load YOLOv8 model
model = YOLO("yolov8s.pt")  # Change model as needed

# Global Variables
cap = None
streaming = False  # Control variable for streaming
recording = False  # Control variable for recording
video_writer = None  # Video writer instance
video_filename = None  # Store current recording file name
output_folder = "recordings"  # Folder to save videos

# Ensure recordings folder exists
os.makedirs(output_folder, exist_ok=True)

def generate_frames():
    global cap, streaming, recording, video_writer, video_filename

    if cap is None or not cap.isOpened():
        cap = cv2.VideoCapture(0)  # Open camera
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    # Start recording when detection starts
    fourcc = cv2.VideoWriter_fourcc(*"XVID")  # Video format
    video_filename = os.path.join(output_folder, f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}.avi")
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    video_writer = cv2.VideoWriter(video_filename, fourcc, 20.0, (frame_width, frame_height))
    recording = True

    while streaming:
        success, frame = cap.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Face Detection
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(40, 40))
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # Body Detection
        bodies = body_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(50, 100))
        for (x, y, w, h) in bodies:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # YOLO Object Detection
        if len(faces) == 0 and len(bodies) == 0:
            results = model(frame, conf=0.5)
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = f"{model.names[cls]} {conf:.2f}"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Write frame to video file
        if recording:
            video_writer.write(frame)

        _, buffer = cv2.imencode(".jpg", frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")

    # Stop recording when streaming stops
    if recording:
        recording = False
        video_writer.release()

    if cap is not None:
        cap.release()  # Release camera when stopping

@app.route("/video_feed")
def video_feed():
    global streaming
    if not streaming:
        streaming = True
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/stop", methods=["POST"])
def stop_stream():
    """Stop the video stream and save the recording."""
    global streaming, cap, recording, video_writer

    streaming = False
    
    if cap is not None:
        cap.release()
        cap = None  # Reset camera instance

    # Stop recording and save the video
    if recording:
        recording = False
        video_writer.release()

    return {"message": "Streaming stopped, video saved"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
