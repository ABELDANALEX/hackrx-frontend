import React, { useEffect, useState } from "react";
import UploadPdf from "../../components/UploadPdf/UploadPdf";
import QuestionsWindow from "../../components/QuestionsWindow/QuestionsWindow";
import "./MainPage.css";

export default function MainPage() {
  const [sessionID, setSessionID] = useState(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [pdfName, setPdfName] = useState(""); // store uploaded PDF name

  // Safe UUID generator (fallback if crypto.randomUUID is not available)
  const generateUUID = () =>
    crypto?.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();

  // Generate or retrieve sessionID from sessionStorage
  useEffect(() => {
    let id = sessionStorage.getItem("sessionID");
    if (!id) {
      id = generateUUID();
      sessionStorage.setItem("sessionID", id);
    } else {
      const uploaded = sessionStorage.getItem(`${id}-pdfUploaded`);
      if (uploaded === "true") {
        setPdfUploaded(true);
        const name = sessionStorage.getItem(`${id}-pdfName`);
        if (name) setPdfName(name);
      }
    }
    setSessionID(id);
  }, []);

  // Restart session: remove all keys starting with current sessionID
  const restartSession = () => {
    const response = window.confirm("Are you sure you want to reset session? All progress will be deleted.")
    if(!response) return;
    if (sessionID) {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(sessionID)) {
          sessionStorage.removeItem(key);
        }
      });

      setSessionID(null);
      setPdfUploaded(false);
      setPdfName("");

      // Start a new session
      const newID = generateUUID();
      sessionStorage.setItem("sessionID", newID);
      setSessionID(newID);

      /*Remember to remove ids from indexedDB as well */
    }
  };

  if (!sessionID) return null; // don't render until sessionID is available

  return (
    <div className="main-page">
      {!pdfUploaded && sessionID && (
        <UploadPdf
          sessionID={sessionID}
          setPdfUploaded={setPdfUploaded}
          setPdfName={setPdfName}
        />
      )}
      {pdfUploaded && sessionID && (
        <>
          <div className="pdf-info-row">
            <div className="pdf-name-container">
              <span className="pdf-name" >
                {pdfName || "Unnamed PDF"}
              </span>
            </div>
            <button className="mainpage-reset" onClick={restartSession}>
              RESET SESSION
            </button>
        </div>

          <QuestionsWindow sessionID={sessionID} />
        </>
)}

    </div>
  );
}
