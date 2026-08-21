import React, { useState } from "react";
import TopNav from "../components/TopNav";
import "./BudgetCalculator.css";

const PLOT_SIZES = [
  { label: "3 Marla", sqft: 817 },
  { label: "5 Marla", sqft: 1361 },
  { label: "8 Marla", sqft: 2178 },
  { label: "10 Marla", sqft: 2722 },
  { label: "1 Kanal", sqft: 5445 },
];

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"];
const FLOOR_OPTIONS = [
  { label: "Ground Only", multiplier: 1 },
  { label: "G+1", multiplier: 1.85 },
  { label: "G+2", multiplier: 2.65 },
];

const TIERS = [
  { key: "basic", label: "Basic", rate: 3500 },
  { key: "classic", label: "Classic", rate: 4200 },
  { key: "premium", label: "Premium", rate: 5200 },
  { key: "royale", label: "Royale", rate: 6500 },
];

function formatRs(amount) {
  return "Rs. " + Math.round(amount).toLocaleString("en-PK");
}

export default function BudgetCalculator() {
  const [plotSize, setPlotSize] = useState(PLOT_SIZES[1].label);
  const [city, setCity] = useState(CITIES[0]);
  const [floors, setFloors] = useState(FLOOR_OPTIONS[1].label);
  const [parking, setParking] = useState(1);
  const [balcony, setBalcony] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const selectedPlot = PLOT_SIZES.find((p) => p.label === plotSize);
  const selectedFloor = FLOOR_OPTIONS.find((f) => f.label === floors);
  const extras = parking * 150000 + balcony * 50000;

  const estimates = TIERS.map((tier) => {
    const base = selectedPlot.sqft * tier.rate * selectedFloor.multiplier;
    return { ...tier, total: base + extras };
  });

  return (
    <div className="calc-page">
      <TopNav />

      <div className="calc-hero">
        <div className="calc-hero-left">
          <h1>House Construction Cost Calculator</h1>

          <div className="calc-stats">
            <div className="calc-stat">
              <span className="calc-stat-number">10,000+</span>
              <span className="calc-stat-label">Homes built</span>
            </div>
            <div className="calc-stat">
              <span className="calc-stat-number">470+</span>
              <span className="calc-stat-label">Quality checks completed</span>
            </div>
            <div className="calc-stat">
              <span className="calc-stat-number">1,000+</span>
              <span className="calc-stat-label">Areas served</span>
            </div>
          </div>

          <p className="calc-description">
            Use NV Homes' cost calculator to get a free, package-wise estimate
            instantly. Residential construction in Pakistan typically runs
            Rs. 3,500–Rs. 6,500 per sqft depending on your city and finish
            tier. Every estimate is backed by fixed-rate contracts and
            milestone-based payments.
          </p>

          <div className="calc-rates-box">
            <span className="calc-rates-title">Indicative Rates Per Sqft</span>
            <div className="calc-rates-grid">
              {TIERS.map((tier) => (
                <div className="calc-rate-card" key={tier.key}>
                  <span className="calc-rate-name">{tier.label}</span>
                  <span className="calc-rate-price">
                    {formatRs(tier.rate)}
                  </span>
                </div>
              ))}
            </div>
            <span className="calc-rates-note">
              Rates vary by city and site conditions.
            </span>
          </div>

          <div className="calc-faq">
            <h3>How are these rates estimated?</h3>
            <p>
              Rates are based on city-level construction cost inputs such as
              plot size, number of floors, material and labour rates,
              foundation type, and soil condition. Final pricing may vary
              based on location, design complexity, approvals, and structural
              requirements.
            </p>
          </div>
        </div>

        <div className="calc-form-card">
          <h2>Calculate My Estimate</h2>
          <form onSubmit={handleSubmit}>
            <label className="calc-field">
              <span>Plot Size</span>
              <select value={plotSize} onChange={(e) => setPlotSize(e.target.value)}>
                {PLOT_SIZES.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="calc-field-hint">
              Indicative rates: {formatRs(TIERS[0].rate)} – {formatRs(TIERS[3].rate)}/sqft
            </span>

            <div className="calc-field-row">
              <label className="calc-field">
                <span>City</span>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="calc-field">
                <span>Floors</span>
                <select value={floors} onChange={(e) => setFloors(e.target.value)}>
                  {FLOOR_OPTIONS.map((f) => (
                    <option key={f.label} value={f.label}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="calc-field-row">
              <label className="calc-field">
                <span>Parking</span>
                <select value={parking} onChange={(e) => setParking(Number(e.target.value))}>
                  {[0, 1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="calc-field-hint">Assumed 130 sqft per unit</span>
              </label>

              <label className="calc-field">
                <span>Balcony</span>
                <select value={balcony} onChange={(e) => setBalcony(Number(e.target.value))}>
                  {[0, 1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="calc-field-hint">Assumed 40 sqft per unit</span>
              </label>
            </div>

            <button type="submit" className="calc-submit-btn">
              Calculate Your Cost
            </button>

            <p className="calc-disclaimer">
              This is an indicative estimate for planning purposes only. Final
              cost depends on a detailed site survey.
            </p>
          </form>
        </div>
      </div>

      {submitted && (
        <div className="calc-results">
          <h2>Your Estimated Cost — {plotSize}, {selectedFloor.label}, {city}</h2>
          <div className="calc-results-grid">
            {estimates.map((tier) => (
              <div className="calc-result-card" key={tier.key}>
                <span className="calc-result-tier">{tier.label}</span>
                <span className="calc-result-total">{formatRs(tier.total)}</span>
                <span className="calc-result-breakdown">
                  {selectedPlot.sqft.toLocaleString("en-PK")} sqft × {formatRs(tier.rate)} × {selectedFloor.multiplier} floors
                  {extras > 0 && <> + {formatRs(extras)} extras</>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}