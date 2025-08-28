import React, { useState } from "react";
import "./UploadPdf.css";

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
      // 🔧 Placeholder: fake API call using Promise + setTimeout
      const fakeApiCall = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ status: "ok", filename: selectedFile.name });
          }, 5500); // simulate 1.5s delay
        });

      const result = await fakeApiCall();
      console.log("Fake API response:", result);

      // Store in sessionStorage for persistence in this tab
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
