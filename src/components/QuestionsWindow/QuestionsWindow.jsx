//components/QuestionsWindow/QuestionsWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import "./QuestionsWindow.css";
import QuestionAnswer from "../../subcomponents/QuestionAnswer/QuestionAnswer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function QuestionsWindow({ sessionID }) {
  const [questions, setQuestions] = useState(() => {
    if (!sessionID) return [];
    const saved = sessionStorage.getItem(`${sessionID}-questions`);
    if (saved) {
      // parse saved questions and mark all as not latest
      return JSON.parse(saved).map(q => ({ ...q, isLatest: false }));
    }
    return [];
});


  const testApiCall = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/hackrx/test`);
        const data = await response.json();
        console.log(data);
        return data;
      } catch (err) {
        console.error("Error connecting to backend:", err);
        return { status: "error", message: "Failed to reach backend" };
      }
       };


  const [currentQuestion, setCurrentQuestion] = useState("");
  const [queue, setQueue] = useState([]); // pending questions
  const activeCount = useRef(0); // tracks current concurrent requests
  const maxConcurrent = 3; //  parallel requests

  // Save questions whenever updated
  useEffect(() => {
    if (!sessionID) return;
    sessionStorage.setItem(`${sessionID}-questions`, JSON.stringify(questions));
  }, [questions, sessionID]);

const fetchAnswer = async (question) => {
  const payload = {
    session_id: sessionID,
    questions: [question]
  };

  const response = await fetch(`${BACKEND_URL}/api/v1/hackrx/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_AUTH_TOKEN"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.answers[0]; // answers array contains one answer per question
};


  const handleAsk = () => {
    if (!currentQuestion.trim()) return;

    const newQA = {
      id: Date.now(), // unique ID
      question: currentQuestion,
      answer: null, // placeholder
      timestamp: new Date().toLocaleTimeString(),
      isLatest: true,
    };

    setQuestions((prev) => [...prev, newQA]);
    setQueue((prev) => [...prev, newQA]); // push into queue
    setCurrentQuestion("");
  };

  // Process queue with semaphore
  useEffect(() => {
  if (queue.length === 0) return;
  if (activeCount.current >= maxConcurrent) return; // wait for slot

  const next = queue[0]; // peek first
  activeCount.current += 1;

  (async () => {
    try {
      const answer = await fetchAnswer(next.question);
      setQuestions((prev) =>
        prev.map((qa) =>
          qa.id === next.id ? { ...qa, answer } : qa
        )
      );
    } catch (err) {
      setQuestions((prev) =>
        prev.map((qa) =>
          qa.id === next.id ? { ...qa, answer: `Error fetching answer.${err}` } : qa //change later
        )
      );
    } finally {

      // dequeue processed item
      setQueue((prev) => prev.slice(1));
      activeCount.current -= 1;
    }
  })();
}, [queue, questions]);


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
            key={qa.id}
            question={qa.question}
            answer={qa.answer}
            isLatest={qa.isLatest} 
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />
        <button onClick={handleAsk} className={`ask-btn${currentQuestion.trim() ? "-active":""}`}>
          ➤
        </button>
      </div>
    </div>
  );
}
