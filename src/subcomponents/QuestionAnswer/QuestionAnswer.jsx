//subcomponents/QuestionAnswer/QuestionAnswer.jsx

import React, { useEffect, useState } from "react";
import "./QuestionAnswer.css";

export default function QuestionAnswer({ question, answer, isLatest }) {
  const [displayed, setDisplayed] = useState("");

 useEffect(() => {
  if (!answer || !isLatest) {
    setDisplayed(answer || "");
    return;
  }

  setDisplayed(""); // Reset displayed text
  const words = answer.split(/(\s+)/);
  let i = 0;

  const interval = setInterval(() => {
    if (i >= words.length) {
      clearInterval(interval);
      return;
    }
    const word = words[i];        // safe access
    setDisplayed((prev) => (prev ? prev + word : word));
    i++;
  }, 50); // adjust speed (ms per word)

  return () => clearInterval(interval);
}, [answer, isLatest]);
  return (
    <div className="qa-card">
      <div className="qa-question">{question}</div>
      <hr className="qa-rule" />
      <div className="qa-answer">
        {answer ? (
          displayed
        ) : (
          <div className="skeleton-loader">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        )}
      </div>
    </div>
  );
}
