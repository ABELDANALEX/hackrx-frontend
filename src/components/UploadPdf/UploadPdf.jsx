//components/UploadPdf/UploadPdf.jsx

import React, { useState, useCallback } from "react";
import "./UploadPdf.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function UploadPdf({ sessionID, setPdfUploaded, setPdfName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // File validation
  const validateFile = useCallback((file) => {
    if (!file) {
      return "No file selected";
    }

    if (file.type !== "application/pdf") {
      return "Please select a valid PDF file";
    }

    if (file.size === 0) {
      return "Selected file is empty";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    return null;
  }, []);

  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      setPdfName("");
      return;
    }

    setSelectedFile(file);
    setPdfName(file.name);
    setError("");
    setUploadProgress(0);
  }, [validateFile, setPdfName]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setError("Please select only one file");
      return;
    }
    
    if (files.length === 1) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const testBackendConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${BACKEND_URL}/api/v1/hackrx/test`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Backend test failed: ${response.status}`);
      }
      
      await response.json(); // Validate JSON response
      return { success: true };
    } catch (err) {
      console.error("Backend connection test failed:", err);
      return { 
        success: false, 
        error: err.name === 'AbortError' ? 'Connection timeout' : 'Backend unavailable'
      };
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    const controller = new AbortController();
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${BACKEND_URL}/api/v1/hackrx/upload?session_id=${encodeURIComponent(sessionID)}`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = "Upload failed";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || `Upload failed (${response.status})`;
        } catch (parseError) {
          // If we can't parse the response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Invalid file. Please check your PDF and try again.";
              break;
            case 413:
              errorMessage = "File too large. Please select a smaller PDF.";
              break;
            case 429:
              errorMessage = "Too many upload attempts. Please wait and try again.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = `Upload failed (${response.status}). Please try again.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || "Upload was not successful");
      }
      
      return data;
      
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error("Upload was cancelled");
      }
      throw err;
    }
  }, [sessionID]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!sessionID) {
      setError("Session not initialized. Please refresh the page.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Test backend connection
      setUploadProgress(10);
      const connectionTest = await testBackendConnection();
      
      if (!connectionTest.success) {
        throw new Error(`Cannot connect to server: ${connectionTest.error}`);
      }

      setUploadProgress(30);

      // Upload the file
      const uploadResult = await uploadFile(selectedFile);
      
      setUploadProgress(80);
      
      console.log("Upload successful:", uploadResult);

      // Save to session storage
      try {
        sessionStorage.setItem(`${sessionID}-pdfUploaded`, "true");
        sessionStorage.setItem(`${sessionID}-pdfName`, selectedFile.name);
      } catch (storageError) {
        console.warn("Failed to save to session storage:", storageError);
        // Continue anyway, the upload was successful
      }
      
      setUploadProgress(100);
      
      // Brief delay to show completion
      setTimeout(() => {
        setPdfUploaded(true);
      }, 500);

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, sessionID, testBackendConnection, uploadFile, setPdfUploaded]);

  const resetSelection = useCallback(() => {
    setSelectedFile(null);
    setPdfName("");
    setError("");
    setUploadProgress(0);
    
    // Reset file input
    const fileInput = document.getElementById("pdfInput");
    if (fileInput) {
      fileInput.value = "";
    }
  }, [setPdfName]);

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
            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{uploadProgress}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pdf-upload-header">
        <h2>Upload a PDF to start</h2>
      </div>

      <div
        className={`drop-area ${dragActive ? "active" : ""} ${selectedFile ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          const fileInput = document.getElementById("pdfInput");
          if (fileInput) fileInput.click();
        }}
      >
        <p className="drag-n-drop-text">
          {dragActive
            ? "Drop your PDF here"
            : selectedFile
            ? "Click to select a different PDF"
            : "Drag & drop your PDF here or click to select"}
        </p>
        <input
          id="pdfInput"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </div>

      {selectedFile && (
        <div className="selected-file-info">
          <p className="selected-file-text">
            Selected file: <span className="selected-file-name">{selectedFile.name}</span>
          </p>
          <p className="file-size">
            Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <button 
            className="change-file-btn" 
            onClick={resetSelection}
            disabled={uploading}
          >
            Choose Different File
          </button>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
        className="upload-btn"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button 
            className="retry-btn" 
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}