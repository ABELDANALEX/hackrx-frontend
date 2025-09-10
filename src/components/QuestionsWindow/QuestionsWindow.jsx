//components/QuestionsWindow/QuestionsWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./QuestionsWindow.css";
import QuestionAnswer from "../../subcomponents/QuestionAnswer/QuestionAnswer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function QuestionsWindow({ sessionID }) {
  const [questions, setQuestions] = useState(() => {
    if (!sessionID) return [];
    try {
      const saved = sessionStorage.getItem(`${sessionID}-questions`);
      if (saved) {
        return JSON.parse(saved).map(q => ({ ...q, isLatest: false }));
      }
    } catch (error) {
      console.error("Error loading saved questions:", error);
      // Clear corrupted data
      sessionStorage.removeItem(`${sessionID}-questions`);
    }
    return [];
  });

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [queue, setQueue] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const activeCount = useRef(0);
  const maxConcurrent = 2; // Reduced from 3 for better performance

  // Test API connection with better error handling
  const testApiCall = useCallback(async () => {
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
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setIsConnected(true);
      return data;
    } catch (err) {
      console.error("Backend connection failed:", err.message);
      setIsConnected(false);
      return { 
        status: "error", 
        message: err.name === 'AbortError' ? "Connection timeout" : "Backend unavailable"
      };
    }
  }, []);

  // Save questions with error handling
  useEffect(() => {
    if (!sessionID) return;
    try {
      sessionStorage.setItem(`${sessionID}-questions`, JSON.stringify(questions));
    } catch (error) {
      console.error("Failed to save questions:", error);
    }
  }, [questions, sessionID]);

  // Improved fetch with proper error handling
  const fetchAnswer = useCallback(async (question) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const payload = {
        session_id: sessionID,
        questions: [question.trim()]
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/hackrx/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          // Removed hardcoded Authorization header
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different HTTP status codes
        let errorMessage = "Sorry, I encountered an error processing your question.";
        
        try {
          const errorData = await response.json();
          // Use backend's error message if available, but keep it user-friendly
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 404:
              errorMessage = "No documents found. Please upload a PDF first.";
              break;
            case 429:
              errorMessage = "Too many requests. Please wait a moment and try again.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = `Request failed (${response.status}). Please try again.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.answers || !Array.isArray(data.answers) || data.answers.length === 0) {
        throw new Error("No answer received from server.");
      }

      setIsConnected(true);
      return data.answers[0];
      
    } catch (err) {
      setIsConnected(false);
      
      if (err.name === 'AbortError') {
        return "Request timed out. Please try asking a shorter or simpler question.";
      }
      
      // Return the specific error message (already user-friendly from above)
      return err.message || "Unable to get an answer right now. Please try again.";
    } finally {
      clearTimeout(timeoutId);
    }
  }, [sessionID]);

  // Enhanced input validation
  const handleAsk = useCallback(() => {
    const trimmedQuestion = currentQuestion.trim();
    
    if (!trimmedQuestion) {
      return;
    }
    
    if (trimmedQuestion.length > 1000) {
      alert("Please keep your question under 1000 characters.");
      return;
    }
    
    // Check for duplicate questions
    const isDuplicate = questions.some(q => 
      q.question.toLowerCase().trim() === trimmedQuestion.toLowerCase()
    );
    
    if (isDuplicate) {
      alert("You've already asked this question!");
      return;
    }

    const newQA = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: trimmedQuestion,
      answer: null,
      timestamp: new Date().toLocaleTimeString(),
      isLatest: true,
    };

    // Mark previous questions as not latest
    setQuestions(prev => [
      ...prev.map(q => ({ ...q, isLatest: false })),
      newQA
    ]);
    
    setQueue(prev => [...prev, newQA]);
    setCurrentQuestion("");
  }, [currentQuestion, questions]);

  // Process queue with better error handling
  useEffect(() => {
    if (queue.length === 0) return;
    if (activeCount.current >= maxConcurrent) return;

    const next = queue[0];
    activeCount.current += 1;

    const processQuestion = async () => {
      try {
        const answer = await fetchAnswer(next.question);
        
        setQuestions(prev =>
          prev.map(qa =>
            qa.id === next.id ? { ...qa, answer } : qa
          )
        );
      } catch (err) {
        console.error("Error processing question:", err);
        setQuestions(prev =>
          prev.map(qa =>
            qa.id === next.id 
              ? { ...qa, answer: "I'm sorry, I couldn't process your question. Please try again." }
              : qa
          )
        );
      } finally {
        setQueue(prev => prev.slice(1));
        activeCount.current -= 1;
      }
    };

    processQuestion();
  }, [queue, fetchAnswer]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }, [handleAsk]);

  // Connection status indicator
  const connectionStatus = !isConnected && (
    <div className="connection-warning">
      ⚠️ Connection issues detected. Some features may not work properly.
    </div>
  );

  if (!sessionID) {
    return (
      <div className="questions-window">
        <div className="file-uploaded-header">
          Loading session...
        </div>
      </div>
    );
  }

  return (
    <div className="questions-window">
      {connectionStatus}
      
      {questions.length === 0 ? (
        <div className="file-uploaded-header">
          PDF uploaded successfully. You can start asking your questions now.
        </div>
      ) : (
        <div className="qa-list">
          {questions.map((qa) => (
            <QuestionAnswer
              key={qa.id}
              question={qa.question}
              answer={qa.answer}
              isLatest={qa.isLatest}
              timestamp={qa.timestamp}
            />
          ))}
        </div>
      )}
      
      <div className="ask-container">
        <input
          type="text"
          placeholder="Type your question... (max 1000 characters)"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          disabled={queue.length >= 5} // Prevent too many queued questions
        />
        <button 
          onClick={handleAsk} 
          className={`ask-btn${currentQuestion.trim() ? "-active" : ""}`}
          disabled={!currentQuestion.trim() || queue.length >= 5}
          title={queue.length >= 5 ? "Please wait for current questions to complete" : "Send question"}
        >
          ➤
        </button>
      </div>
      
      {queue.length > 0 && (
        <div className="queue-status">
          {queue.length} question{queue.length > 1 ? 's' : ''} processing...
        </div>
      )}
    </div>
  );
}