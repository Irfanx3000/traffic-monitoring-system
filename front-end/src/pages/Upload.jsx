import React, { useState } from "react";
import { uploadVideo } from "../services/api";

const API_BASE = "http://localhost:5000";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStream, setShowStream] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a video first");
      return;
    }

    try {
      setLoading(true);
      setShowStream(false); // 🔑 reset stream

      const res = await uploadVideo(file);
      setVideoName(res.video);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card upload-card">
      <h2>Upload Traffic Video</h2>

      {/* FILE INPUT */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* UPLOAD BUTTON */}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Video"}
      </button>

      {/* AFTER UPLOAD */}
      {videoName && (
        <div style={{ marginTop: "16px" }}>
          <p>
            <strong>Uploaded Video:</strong> {videoName}
          </p>

          <button
            onClick={() => setShowStream(true)}
            style={{ marginTop: "10px" }}
          >
            Start Detection Stream
          </button>
        </div>
      )}

      {/* LIVE STREAM */}
      {showStream && videoName && (
        <div className="video-stream" style={{ marginTop: "24px" }}>
          <h3>Live Detection Stream</h3>

          <img
            src={`${API_BASE}/api/video-stream?video=${videoName}`}
            alt="Live Detection Stream"
            style={{
              width: "100%",
              maxWidth: "900px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
        </div>
      )}
    </div>
  );
}
