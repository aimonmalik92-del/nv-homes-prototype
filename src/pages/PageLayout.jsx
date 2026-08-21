import React from "react";
import { Link } from "react-router-dom";
import "./PageLayout.css";

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="page-layout">
      <header className="page-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </header>

      <main className="page-main">
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}