import { Link } from "react-router-dom";
import "./TopNav.css";

const NAV_LINKS = [
  { label: "Budget Calculator", path: "/budget-calculator", active: true },
  { label: "Project Budget Tracking", path: "/dashboard" },
  { label: "Quality Checklist", path: "/checklists" },
  { label: "Timeline", path: "/timeline" },
  { label: "SOP's", soon: true },
];

export default function TopNav() {
  return (
    <header className="topnav">
      <Link to="/" className="topnav-brand">
        <span className="topnav-logo">N</span>
        <span className="topnav-wordmark">NV HOMES</span>
      </Link>

      <nav className="topnav-links">
        {NAV_LINKS.map((link) =>
          link.soon ? (
            <span className="topnav-link topnav-link-soon" key={link.label}>
              {link.label}
              <span className="topnav-soon-badge">Soon</span>
            </span>
          ) : (
            <Link
              to={link.path}
              className={`topnav-link${link.active ? " topnav-link-active" : ""}`}
              key={link.label}
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <Link to="/" className="topnav-cta">
        ← Home
      </Link>
    </header>
  );
}