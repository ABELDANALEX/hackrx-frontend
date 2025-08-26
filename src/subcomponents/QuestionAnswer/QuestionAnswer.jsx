import React from "react";
import "./QuestionAnswer.css";

export default function QuestionAnswer({ question, answer }) {
  return (
    <div className="qa-card">
      <div className="qa-question">
        <strong>Q:</strong> {question}
      </div>
      <div className="qa-answer">
        <strong>A:</strong> {answer}
      </div>
    </div>
  );
}
