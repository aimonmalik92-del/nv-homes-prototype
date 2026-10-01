import { useState } from "react";
import TopNav from "../components/TopNav";
import { calculator } from "../api/endpoints";
import { formatRs } from "../api/format";
import { useApi } from "../hooks/useApi";
import "./BudgetCalculator.css";

// Pricing lives on the server (POST /api/calculator/estimate). This page
// only renders the options it is given and the estimate it gets back.

export default function BudgetCalculator() {
  const options = useApi((signal) => calculator.options({ signal }), []);
  const [edited, setEdited] = useState(null);
  const form = edited ?? options.data?.defaults ?? null;
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setEdited({ ...form, [key]: value });

  const run = async (input) => {
    setBusy(true);
    setError(null);
    try {
      setResult(await calculator.estimate(input));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(form);
  };

  const pickPackage = (key) => {
    const next = { ...form, package: key };
    setEdited(next);
    run(next);
  };

  const opts = options.data;
  const label = (list, key, value) => list?.find((x) => x[key] === value)?.label ?? value;
  const maxStage = result ? Math.max(...result.stages.map((s) => s.cost)) : 1;

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
            instantly. Every estimate is backed by fixed-rate contracts and
            milestone-based payments.
          </p>
          <div className="calc-rates-box">
            <span className="calc-rates-title">Indicative Rates Per Sqft</span>
            <div className="calc-rates-grid">
              {(opts?.packages ?? []).map((pkg) => (
                <div className="calc-rate-card" key={pkg.key}>
                  <span className="calc-rate-name">{pkg.name}</span>
                  <span className="calc-rate-price">{formatRs(pkg.rate)}</span>
                </div>
              ))}
            </div>
            <span className="calc-rates-note">Rates vary by city and site conditions.</span>
          </div>
          <div className="calc-faq">
            <h3>How are these rates estimated?</h3>
            <p>
              Built-up area is 82% of the plot per floor. Each floor is priced at the
              package rate adjusted for the city, with upper floors slightly cheaper.
              Final pricing may vary based on location, design complexity, approvals,
              and structural requirements.
            </p>
          </div>
        </div>

        <div className="calc-form-card">
          <h2>Calculate My Estimate</h2>
          {options.error && <p className="calc-disclaimer" role="alert">Couldn't load the calculator: {options.error.message}</p>}
          {form && opts && (
            <form onSubmit={handleSubmit}>
              <div className="calc-field-row">
                <label className="calc-field">
                  <span>Plot Size</span>
                  <select value={form.plot_marla} onChange={(e) => set("plot_marla", Number(e.target.value))}>
                    {opts.plot_sizes.map((p) => <option key={p.marla} value={p.marla}>{p.label}</option>)}
                  </select>
                </label>
                <label className="calc-field">
                  <span>City</span>
                  <select value={form.city} onChange={(e) => set("city", e.target.value)}>
                    {opts.cities.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="calc-field-row">
                <label className="calc-field">
                  <span>Floors</span>
                  <select value={form.floors} onChange={(e) => set("floors", Number(e.target.value))}>
                    {opts.floors.map((f) => <option key={f.floors} value={f.floors}>{f.label}</option>)}
                  </select>
                </label>
                <label className="calc-field">
                  <span>Package</span>
                  <select value={form.package} onChange={(e) => set("package", e.target.value)}>
                    {opts.packages.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="calc-field-row">
                <label className="calc-field">
                  <span>
                    <input type="checkbox" checked={form.boundary_wall} onChange={(e) => set("boundary_wall", e.target.checked)} />{" "}
                    Boundary wall
                  </span>
                </label>
                <label className="calc-field">
                  <span>
                    <input type="checkbox" checked={form.car_porch} onChange={(e) => set("car_porch", e.target.checked)} />{" "}
                    Car porch
                  </span>
                  <span className="calc-field-hint">Assumed 130 sqft</span>
                </label>
              </div>
              <button type="submit" className="calc-submit-btn" disabled={busy}>
                {busy ? "Calculating…" : "Calculate Your Cost"}
              </button>
              {error && <p className="calc-disclaimer" role="alert">{error}</p>}
              <p className="calc-disclaimer">
                This is an indicative estimate for planning purposes only. Final
                cost depends on a detailed site survey.
              </p>
            </form>
          )}
        </div>
      </div>

      {result && (
        <div className="calc-results">
          <h2>
            Your Estimated Cost — {formatRs(result.total_cost)}
          </h2>
          <p className="calc-disclaimer">
            {result.package.name} · {result.total_area_sqft.toLocaleString("en-PK")} sqft ·{" "}
            {label(opts?.floors, "floors", result.input.floors)} · {result.city.name} ·{" "}
            {formatRs(result.avg_rate_per_sqft)}/sqft
          </p>

          <div className="calc-results-grid">
            {result.package_comparison.map((pkg) => (
              <button
                type="button"
                className="calc-result-card"
                key={pkg.key}
                onClick={() => pickPackage(pkg.key)}
                aria-pressed={pkg.key === result.package.key}
                style={pkg.key === result.package.key ? { outline: "2px solid #356D65" } : undefined}
              >
                <span className="calc-result-tier">{pkg.name}</span>
                <span className="calc-result-total">{formatRs(pkg.total_cost)}</span>
                <span className="calc-result-breakdown">{formatRs(pkg.rate_per_sqft)}/sqft base</span>
              </button>
            ))}
          </div>

          <h3>Stage-wise breakdown</h3>
          <table className="calc-table" style={{ width: "100%" }}>
            <tbody>
              {result.stages.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td style={{ width: "40%" }}>
                    <div style={{ background: "#F7ECDF", borderRadius: 6 }}>
                      <div style={{ width: `${Math.max(6, Math.round((s.cost / maxStage) * 100))}%`, height: 8, background: "#356D65", borderRadius: 6 }} />
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>~Rs {(s.cost / 100000).toFixed(2)}L</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Floor-wise breakdown</h3>
          <table className="calc-table" style={{ width: "100%" }}>
            <thead>
              <tr><th align="left">Floor</th><th align="right">Area (sqft)</th><th align="right">Rate</th><th align="right">Cost</th></tr>
            </thead>
            <tbody>
              {result.floor_rows.map((f) => (
                <tr key={f.name}>
                  <td>{f.name}</td>
                  <td align="right">{f.area_sqft.toLocaleString("en-PK")}</td>
                  <td align="right">{formatRs(f.rate_per_sqft)}</td>
                  <td align="right">{formatRs(f.cost)}</td>
                </tr>
              ))}
              {result.boundary_wall_cost > 0 && (
                <tr><td>Boundary Wall</td><td align="right">—</td><td align="right">—</td><td align="right">{formatRs(result.boundary_wall_cost)}</td></tr>
              )}
              {result.car_porch_cost > 0 && (
                <tr><td>Car Porch</td><td align="right">130</td><td align="right">—</td><td align="right">{formatRs(result.car_porch_cost)}</td></tr>
              )}
              <tr><td colSpan={3}><strong>Total Estimated Cost</strong></td><td align="right"><strong>{formatRs(result.total_cost)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
