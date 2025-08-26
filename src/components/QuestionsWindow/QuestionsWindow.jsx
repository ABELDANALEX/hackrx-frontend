import React, { useState, useEffect } from "react";
import "./QuestionsWindow.css";
import QuestionAnswer from "../../subcomponents/QuestionAnswer/QuestionAnswer";

export default function QuestionsWindow({ sessionID }) {
  const [questions, setQuestions] = useState(() => {
    if (!sessionID) return [];
    const saved = sessionStorage.getItem(`${sessionID}-questions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentQuestion, setCurrentQuestion] = useState("");

  // Save questions whenever updated
  useEffect(() => {
    if (!sessionID) return;
    sessionStorage.setItem(`${sessionID}-questions`, JSON.stringify(questions));
  }, [questions, sessionID]);

  const handleAsk = () => {
    if (!currentQuestion.trim()) return;

    const newQA = {
      question: currentQuestion,
      answer: `Answer for: "${currentQuestion}"`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setQuestions((prev) => [...prev, newQA]);
    setCurrentQuestion("");
  };

  return (
    <div className="questions-window">
      {questions.length === 0 ? (
        <div className="file-uploaded-header">
          PDF uploaded successfully. You can start asking your questions now.
        </div>
      ) : (
        <div className="qa-list">
          {questions.map((qa, idx) => (
            <QuestionAnswer
              key={idx}
              question={qa.question}
              answer={qa.answer}
              timestamp={qa.timestamp}
            />
          ))}
        </div>
      )}
      <div className="ask-container">
        <input
          type="text"
          placeholder="Type your question..."
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          onKeyDown = {(e) =>{
            if(e.key === "Enter") handleAsk()
          }}
        />
        <button onClick={handleAsk} className="ask-btn">➤</button>
      </div>
    </div>
  );
}
