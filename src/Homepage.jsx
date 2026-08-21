import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const chips = [
  { label: "Calculate Your House Budget", path: "/budget-calculator" },
  { label: "Track Your Real-Time Construction Budget", path: "/dashboard" },
  { label: "Quality Checklist for Your House Construction", path: null },
  { label: "SOP's for Your House Construction", path: null },
];

const navItems = [
  {
    tooltip: "Search",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
    ),
  },
  {
    tooltip: "New Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14"></path>
      </svg>
    ),
  },
  {
    tooltip: "Calculate Budget",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2"></rect>
        <path d="M8 6h8M8 10h8M8 14h4"></path>
      </svg>
    ),
  },
  {
    tooltip: "Construction SOP's",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
  },
  {
    tooltip: "Quality Checklists",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    ),
  },
  {
    tooltip: "Project",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    tooltip: "History",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
  },
];

// ---- Auth option button data (icon + label), separate for login vs signup ----
const GoogleIcon = () => (
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="Google" />
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const loginOptions = [
  { key: "google", icon: <GoogleIcon />, label: "Login with Google" },
  { key: "x", icon: <XIcon />, label: "Login with X" },
  { key: "apple", icon: <AppleIcon />, label: "Login with Apple" },
  { key: "email", icon: <EmailIcon />, label: "Login with email" },
];

const signupOptions = [
  { key: "x", icon: <XIcon />, label: "Sign up with X", primary: true },
  { key: "email", icon: <EmailIcon />, label: "Sign up with email" },
  { key: "apple", icon: <AppleIcon />, label: "Sign up with Apple" },
  { key: "google", icon: <GoogleIcon />, label: "Sign up with Google" },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const openAuth = (loginMode) => {
    setIsLoginMode(loginMode);
    setAuthOpen(true);
  };

  const handleSend = () => {
    const query = searchValue.trim();
    if (query) alert("You asked: " + query);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const options = isLoginMode ? loginOptions : signupOptions;

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`menu-btn${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Left Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">N</div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button className="nav-item" data-tooltip={item.tooltip} key={item.tooltip}>
                {item.icon}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-avatar" data-tooltip="User Account">
            <span>B</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-bar">
          <div></div>
          <div className="auth-buttons">
            <a
              href="#"
              className="sign-in"
              onClick={(e) => {
                e.preventDefault();
                openAuth(true);
              }}
            >
              Sign In
            </a>
            <a
              href="#"
              className="sign-up"
              onClick={(e) => {
                e.preventDefault();
                openAuth(false);
              }}
            >
              Sign Up
            </a>
          </div>
        </header>

        <main className="hero">
          <div className="logo-section">
            <div className="logo-circle">
              <img
                src="/logo.png"
                alt="NV Homes Logo"
                className="logo-img"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <h1>NV HOMES</h1>
            <p className="tagline">Pakistan's First AI Powered Home Construction Assistant</p>
          </div>

          <div className="search-container">
            <div className="search-bar">
              <span className="plus-icon">+</span>
              <input
                type="text"
                placeholder="Ask anything about your project..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="send-btn" onClick={handleSend}>
                ↑
              </button>
            </div>
          </div>

          <div className="suggestions">
            {chips.map((chip) => (
              <button
                className="chip"
                key={chip.label}
                onClick={() =>
                  chip.path ? navigate(chip.path) : setSearchValue(chip.label)
                }
              >
                {chip.label}
              </button>
            ))}
          </div>
        </main>

        <footer className="footer">Residential Construction • AI-Powered Project Control</footer>
      </div>

      {/* AUTH MODAL (Login + Signup) */}
      <div
        className={`modal-overlay${authOpen ? " active" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setAuthOpen(false);
        }}
      >
        <div className="login-modal">
          <button className="modal-close" onClick={() => setAuthOpen(false)}>
            ×
          </button>

          <h2>{isLoginMode ? "Log into your account" : "Create your account"}</h2>

          <div className="login-options">
            {options.map((opt) => (
              <button
                className={`login-btn${opt.primary ? " primary" : ""}`}
                key={opt.key}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          <p className="signup-text">
            {isLoginMode ? (
              <>
                Don't have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginMode(false);
                  }}
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginMode(true);
                  }}
                >
                  Sign in
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}