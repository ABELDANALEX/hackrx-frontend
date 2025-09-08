//components/UploadPdf/UploadPdf.jsx

import React, { useState } from "react";
import "./UploadPdf.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function UploadPdf({ sessionID, setPdfUploaded, setPdfName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setPdfName(file.name);
      setError("");
    } else {
      setSelectedFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setError("");

  try {
    // 1️⃣ Test backend connection (existing)
    const testApiCall = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/hackrx/test`);
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error connecting to backend:", err);
        return { status: "error", message: "Failed to reach backend" };
      }
    };

    const testResult = await testApiCall();
    console.log("Test backend response:", testResult);

    // 2️⃣ Upload PDF to backend
    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadResponse = await fetch(`${BACKEND_URL}/api/v1/hackrx/upload?session_id=${sessionID}`, {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      setError(uploadData.detail || "Failed to upload PDF");
      return;
    }

    console.log("PDF upload response:", uploadData);

    // Store in sessionStorage for persistence
    sessionStorage.setItem(`${sessionID}-pdfUploaded`, "true");
    sessionStorage.setItem(`${sessionID}-pdfName`, selectedFile.name);

    setPdfUploaded(true);
  } catch (err) {
    setError("Error uploading file: " + err.message);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="upload-pdf-container">
        {uploading && (
            <div className="upload-overlay">
                <div className="uploading-container">
                <div className="spinner"></div>
                <div className="uploading-text">
                    Uploading
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                </div>
                </div>
            </div>
        )}

        <div className="pdf-upload-header"><h2>Upload a PDF to start</h2></div>

        <div
            className={`drop-area ${dragActive ? "active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("pdfInput").click()}
        >
            <p className="drag-n-drop-text">
                {dragActive
                    ? "Drop your PDF here"
                    : "Drag & drop your PDF here or click to select"}
            </p>
            <input
                id="pdfInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>

        {selectedFile && (
            <p className="selected-file-text">
            Selected file: <span className="selected-file-name">{selectedFile.name}</span>
            </p>
        )}

        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload PDF"}
        </button>

        {error && <p className="error-text">{error}</p>}
    </div>

  );
}
