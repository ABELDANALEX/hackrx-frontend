import React from "react";
import "./QuestionAnswer.css";

export default function QuestionAnswer({ question, answer }) {
  return (
    <div className="qa-card">
      <div className="qa-question">
        <strong></strong> {question}
      </div>
      <hr className="qa-rule"/>
      <div className="qa-answer">
        <strong></strong> {answer}
      </div>
    </div>
  );
}
