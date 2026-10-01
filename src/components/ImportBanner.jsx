import { useState } from "react";
import { importer } from "../api/endpoints";

// Keys the old static pages (same origin, served at /) wrote to localStorage.
const KEYS = {
  budget: "nextrack-activity-budget-v1",
  checklists: "nvhomes-quality-checklists-v1",
  timeline: "nvhomes-project-timeline-v2",
};
const doneKey = (projectId) => `nvhomes.imported.${projectId}`;

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function findOldData() {
  const found = {};
  Object.entries(KEYS).forEach(([k, key]) => { const v = read(key); if (v && typeof v === "object") found[k] = v; });
  const summary = [];
  if (found.budget?.expenses?.length) summary.push(plural(found.budget.expenses.length, "expense"));
  else if (found.budget) summary.push("budget totals");
  if (found.checklists?.acts) summary.push(plural(Object.keys(found.checklists.acts).length, "checklist"));
  if (found.timeline?.acts) summary.push("timeline progress");
  return { found, summary };
}

/**
 * Offers a one-time copy of data the old pages kept in this browser into the
 * current project (POST /api/projects/{id}/import/browser-data). Safe to
 * repeat; the server skips expenses it already has.
 */
export default function ImportBanner({ projectId }) {
  const [{ found, summary }] = useState(findOldData);
  const [hidden, setHidden] = useState(() => { try { return Boolean(localStorage.getItem(doneKey(projectId))); } catch { return false; } });
  const [state, setState] = useState({ busy: false, report: null, error: null });

  if (hidden || summary.length === 0) return null;

  const dismiss = () => { try { localStorage.setItem(doneKey(projectId), "dismissed"); } catch { /* ignore */ } setHidden(true); };
  const run = async () => {
    setState({ busy: true, report: null, error: null });
    try {
      const report = await importer.browserData(projectId, found);
      try { localStorage.setItem(doneKey(projectId), new Date().toISOString()); } catch { /* ignore */ }
      setState({ busy: false, report, error: null });
    } catch (e) {
      setState({ busy: false, report: null, error: e.message });
    }
  };

  const r = state.report;
  return (
    <section className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm" aria-label="Import old data">
      {!r ? (
        <>
          <p className="font-medium text-slate-800">This browser has data from the old NEXTRACK pages: {summary.join(", ")}.</p>
          <p className="text-slate-600 mt-1">Copy it into this project so it's saved on the server and visible to your team. Budgets, checklists and timeline entries in this project will be replaced; expenses are added.</p>
          {state.error && <p className="text-red-600 mt-2" role="alert">{state.error}</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={run} disabled={state.busy} className="bg-[#356D65] text-white px-4 py-1.5 rounded-lg disabled:opacity-60">{state.busy ? "Importing…" : "Import now"}</button>
            <button onClick={dismiss} className="px-4 py-1.5 rounded-lg border border-amber-300">Not now</button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium text-emerald-800">Import finished. Reload the page to see the data.</p>
          <ul className="mt-1 text-slate-700 list-disc pl-5">
            {r.budget && <li>{plural(r.budget.expenses_added, "expense")} added{r.budget.expenses_already_imported ? `, ${r.budget.expenses_already_imported} already imported` : ""}; {r.budget.activity_budgets_set} activity budgets set</li>}
            {r.checklists && <li>{plural(r.checklists.activities_imported, "checklist")} imported</li>}
            {r.timeline && <li>{r.timeline.activities_imported} timeline activities imported{r.timeline.baseline_imported ? " with baseline" : ""}</li>}
          </ul>
          {r.issues.length > 0 && (
            <details className="mt-2"><summary className="cursor-pointer text-amber-800">{r.issues.length === 1 ? "1 entry" : `${r.issues.length} entries`} skipped</summary>
              <ul className="list-disc pl-5 text-slate-600">{r.issues.map((i) => <li key={i}>{i}</li>)}</ul>
            </details>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={() => window.location.reload()} className="bg-[#356D65] text-white px-4 py-1.5 rounded-lg">Reload</button>
            <button onClick={() => setHidden(true)} className="px-4 py-1.5 rounded-lg border border-amber-300">Close</button>
          </div>
        </>
      )}
    </section>
  );
}
