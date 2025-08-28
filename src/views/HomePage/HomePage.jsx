// File: HomePage.jsx
// Path: src/pages/HomePage/HomePage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  const scrollToHow = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="homepage-container">
      <div className="hero-bg" aria-hidden>
        <div className="bg-gradient" />
        <svg className="float-icon icon-pdf" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#FFDD57" />
          <path d="M13 2v5h5" fill="#FFB84D" />
          <text x="7" y="14" fontSize="8" fontWeight="700" fill="#222">PDF</text>
        </svg>
        <svg className="float-icon icon-ai" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="#7CE7C7" />
          <path d="M8 12a4 4 0 0 1 8 0" stroke="#074F3E" strokeWidth="0.8" fill="none" />
          <path d="M12 7v-2" stroke="#074F3E" strokeWidth="0.8" />
        </svg>
        <svg className="float-icon icon-search" viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="5" fill="#A3C4FF" />
          <rect x="16" y="16" width="6" height="2" transform="rotate(45 16 16)" fill="#3D5AFE" />
        </svg>
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
      </div>

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">RAG — PDF Assistant</h1>
          <p className="hero-subtitle">
            Ask questions from your documents instantly. We pair vector search with a language model to
            return precise, context-aware answers straight from your PDFs.
          </p>
          <div className="hero-actions">
            <button className="cta-btn primary" onClick={() => navigate("/main")}>Upload PDF & Start</button>
            <button className="cta-btn ghost" onClick={scrollToHow}>How it works</button>
          </div>
          <div className="small-note">No account required — your files stay local unless you choose otherwise.</div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="info-section about-rag">
          <h2>About RAG</h2>
          <p>
            Retrieval-Augmented Generation (RAG) augments a language model with a retrieval step: we first find
            the most relevant chunks from your PDFs (via vector search) and then generate answers grounded on
            that content. This reduces hallucinations and speeds up responses.
          </p>
        </section>

        <section id="how-it-works" className="info-section">
          <h2>How it works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Upload</h3>
              <p>Drop or select PDFs. The client prepares the files and sends them to the processing pipeline.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Embed</h3>
              <p>Documents are split into chunks and converted to vector embeddings for semantic search.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Retrieve</h3>
              <p>For every question, we retrieve top-k relevant chunks from the vector store.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h3>Answer</h3>
              <p>The language model composes an answer using the retrieved context and returns citations.</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Why use this</h2>
          <div className="features-grid">
            <div className="feature-card">Fast & accurate answers</div>
            <div className="feature-card">Citations to original text</div>
            <div className="feature-card">Local-first file handling</div>
            <div className="feature-card">Batch uploads & multi-doc search</div>
          </div>
        </section>
      </main>

      <footer className="homepage-footer">
        <div>© 2025 RAG-PDF Assistant</div>
        <div>Built with React + FastAPI • Vector Embeddings</div>
      </footer>
    </div>
  );
}
