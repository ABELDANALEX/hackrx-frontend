import React, { useEffect, useState } from "react";
// import UploadPdf from "../../components/UploadPdf/UploadPdf";
import QuestionsWindow from "../../components/QuestionsWindow/QuestionsWindow";
import "./MainPage.css";

export default function MainPage() {
  const [sessionID, setSessionID] = useState(null);
  const [pdfUploaded, setpdfUploaded] = useState(true) //false

  // Generate or retrieve sessionID from sessionStorage
  useEffect(() => {
    let id = sessionStorage.getItem("sessionID");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sessionID", id);
    }else{
      const uploaded = sessionStorage.getItem(`${id}-pdfUploaded`)
      if (uploaded == "true") setpdfUploaded(true)
    }
    setSessionID(id);
  }, []);


  if (!sessionID) return null //don't render until sessionID is available
  return (
    <div className="main-page">
      {!pdfUploaded && sessionID && (
        <UploadPdf sessionID={sessionID} setpdfUploaded={setpdfUploaded} />
      )}
      {pdfUploaded && sessionID && <QuestionsWindow sessionID={sessionID} />}
    </div>
  );
}
