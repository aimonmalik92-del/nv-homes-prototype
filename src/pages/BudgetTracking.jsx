import { Fragment, useState } from "react";
import PortalShell from "../components/PortalShell";
import ExpenseForm from "../components/ExpenseForm";
import { budget } from "../api/endpoints";
import { formatLacs, formatRs } from "../api/format";
import { useApi } from "../hooks/useApi";

// Activity-wise budget & expenses: replaces budget-tracking-system.html.
// GET/PUT /api/projects/{id}/budget/... and .../budget/expenses

const STATUS_STYLE = {
  not_started: "bg-slate-100 text-slate-600",
  within_budget: "bg-emerald-100 text-emerald-700",
  near_limit: "bg-amber-100 text-amber-700",
  over_budget: "bg-red-100 text-red-700",
};
const PART_LABEL = { grey: "Grey Work", finishing: "Finishing Work" };

export default function BudgetTracking() {
  return <PortalShell title="Budget Tracking">{(project) => <BudgetView key={project.id} projectId={project.id} />}</PortalShell>;
}

function BudgetView({ projectId }) {
  const q = useApi((signal) => budget.get(projectId, { signal }), [projectId]);
  const [part, setPart] = useState("grey");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState({});
  const [form, setForm] = useState(null); // {initial?, activity}
  const [expTick, setExpTick] = useState(0);
  const [error, setError] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (q.error) return <p role="alert" className="text-red-600">Couldn't load the budget: {q.error.message}</p>;
  if (!q.data) return <p className="text-slate-500">Loading budget…</p>;

  const data = q.data;
  const current = data.parts.find((p) => p.part === part);
  const allActivities = data.parts.flatMap((p) => p.activities.map((a) => ({ ...a, part: p.part })));
  const rows = current.activities.filter((a) => !search || `${a.activity_no} ${a.title} ${a.phase}`.toLowerCase().includes(search.toLowerCase()));

  const act = async (fn) => {
    setError(null);
    try { await fn(); q.reload(); setExpTick((t) => t + 1); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total budget" value={formatLacs(data.total_budget)} />
        <Stat label="Spent" value={formatLacs(data.total_spent)} sub={`${data.used_pct}% used`} />
        <Stat label="Remaining" value={formatLacs(data.remaining)} tone={data.remaining < 0 ? "bad" : undefined} />
        <Stat label="Over-budget activities" value={data.parts.reduce((m, p) => m + p.over_budget_count, 0)} tone={data.parts.some((p) => p.over_budget_count) ? "bad" : undefined} />
      </div>

      <div className="bg-white rounded-2xl border border-[#F1CBB5]">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#F1CBB5]">
          <div role="tablist" aria-label="Work part" className="flex gap-1 bg-[#F7ECDF] p-1 rounded-lg">
            {data.parts.map((p) => (
              <button key={p.part} role="tab" aria-selected={p.part === part} onClick={() => { setPart(p.part); setOpen({}); }}
                className={`px-3 py-1.5 rounded-md text-sm ${p.part === part ? "bg-white shadow-sm font-medium" : "text-slate-600"}`}>
                {PART_LABEL[p.part]}
              </button>
            ))}
          </div>
          <label className="text-sm flex items-center gap-2">
            {PART_LABEL[part]} total (Rs)
            <MoneyInput key={`${part}-${current.total}`} value={current.total} ariaLabel={`${PART_LABEL[part]} total`}
              onCommit={(v) => v > 0 && v !== current.total && act(() => budget.setPartTotal(projectId, part, v))} />
          </label>
          <span className="text-sm text-slate-500">Spent {formatRs(current.spent)} · {current.used_pct}%</span>
          {confirmReset ? (
            <span className="text-sm flex items-center gap-2">
              Reset activity budgets to the standard split? Expenses are kept.
              <button className="px-3 py-1 rounded-lg bg-[#356D65] text-white" onClick={() => { setConfirmReset(false); act(() => budget.resetSplit(projectId, part)); }}>Reset</button>
              <button className="px-3 py-1 rounded-lg border border-[#F1CBB5]" onClick={() => setConfirmReset(false)}>Cancel</button>
            </span>
          ) : (
            <button className="text-sm px-3 py-1.5 rounded-lg border border-[#F1CBB5]" onClick={() => setConfirmReset(true)}>Reset budget split</button>
          )}
          <input type="search" placeholder="Search activities" aria-label="Search activities" value={search} onChange={(e) => setSearch(e.target.value)}
            className="ml-auto border border-[#F1CBB5] rounded-lg px-3 py-1.5 text-sm" />
          <button className="text-sm px-3 py-1.5 rounded-lg bg-[#356D65] text-white" onClick={() => setForm({ activity: current.activities[0].activity_no })}>+ Add expense</button>
        </div>
        {error && <p role="alert" className="px-4 pt-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F7ECDF] text-left text-xs text-slate-600">
              <tr>
                <th className="px-4 py-2">#</th><th className="px-2 py-2">Activity</th><th className="px-2 py-2 text-right">Budget (Rs)</th>
                <th className="px-2 py-2 text-right">Spent</th><th className="px-2 py-2 text-right">Remaining</th>
                <th className="px-2 py-2 w-40">Used</th><th className="px-2 py-2">Status</th><th className="px-4 py-2 text-right">Expenses</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <Fragment key={a.activity_no}>
                  <tr className="border-b border-[#F7ECDF] hover:bg-[#FBF6F0]">
                    <td className="px-4 py-2 text-slate-500">{a.activity_no}</td>
                    <td className="px-2 py-2"><div className="font-medium">{a.title}</div><div className="text-xs text-slate-500">{a.phase}</div></td>
                    <td className="px-2 py-2 text-right">
                      <MoneyInput key={`${a.activity_no}-${a.budget}`} value={a.budget} ariaLabel={`Budget for ${a.title}`} allowZero
                        onCommit={(v) => v !== a.budget && act(() => budget.setActivityBudget(projectId, a.activity_no, v))} />
                    </td>
                    <td className="px-2 py-2 text-right">{formatRs(a.spent)}</td>
                    <td className={`px-2 py-2 text-right ${a.remaining < 0 ? "text-red-600" : ""}`}>{formatRs(a.remaining)}</td>
                    <td className="px-2 py-2">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden" title={`${a.used_pct}%`}>
                        <div className={`h-full ${a.used_pct > 100 ? "bg-red-500" : a.used_pct >= 90 ? "bg-amber-500" : "bg-[#356D65]"}`} style={{ width: `${Math.min(100, a.used_pct)}%` }} />
                      </div>
                    </td>
                    <td className="px-2 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status.code]}`}>{a.status.label}</span></td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-[#356D65] underline" aria-expanded={Boolean(open[a.activity_no])}
                        onClick={() => setOpen((o) => ({ ...o, [a.activity_no]: !o[a.activity_no] }))}>
                        {a.expense_count} {open[a.activity_no] ? "▴" : "▾"}
                      </button>
                    </td>
                  </tr>
                  {open[a.activity_no] && (
                    <tr className="bg-[#FBF6F0]"><td colSpan={8} className="px-4 py-3">
                      <ExpenseList projectId={projectId} activityNo={a.activity_no} tick={expTick}
                        onAdd={() => setForm({ activity: a.activity_no })} onEdit={(e) => setForm({ initial: e })}
                        onDelete={(e) => act(() => budget.deleteExpense(projectId, e.id))} />
                    </td></tr>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No activities match “{search}”.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <ExpenseForm projectId={projectId} activities={allActivities} initial={form.initial} defaultActivity={form.activity}
          onClose={() => setForm(null)}
          onSaved={(saved) => { setForm(null); setOpen((o) => ({ ...o, [saved.activity_no]: true })); q.reload(); setExpTick((t) => t + 1); }} />
      )}
    </div>
  );
}

function ExpenseList({ projectId, activityNo, tick, onAdd, onEdit, onDelete }) {
  const q = useApi((signal) => budget.listExpenses(projectId, { activity_no: activityNo, limit: 200 }, { signal }), [projectId, activityNo, tick]);
  const [confirm, setConfirm] = useState(null);
  if (q.error) return <p role="alert" className="text-red-600">{q.error.message}</p>;
  if (!q.data) return <p className="text-slate-500">Loading expenses…</p>;
  return (
    <div>
      {q.data.items.length === 0 ? <p className="text-slate-500 text-sm">No expenses recorded yet.</p> : (
        <table className="w-full text-xs">
          <thead className="text-slate-500 text-left"><tr>
            <th className="py-1">Date</th><th>Description</th><th>Category</th><th>Vendor / Bill</th><th className="text-right">Qty × Rate</th>
            <th className="text-right">Amount</th><th>Paid by</th><th />
          </tr></thead>
          <tbody>
            {q.data.items.map((e) => (
              <tr key={e.id} className="border-t border-[#F1CBB5]">
                <td className="py-1.5">{e.expense_date}</td><td>{e.description}</td><td>{e.category}</td>
                <td>{[e.vendor, e.bill_no].filter(Boolean).join(" · ") || "—"}</td>
                <td className="text-right">{e.quantity && e.rate ? `${e.quantity} ${e.unit || ""} × ${formatRs(e.rate)}` : "—"}</td>
                <td className="text-right font-medium">{formatRs(e.amount)}</td><td>{e.payment_mode}</td>
                <td className="text-right whitespace-nowrap">
                  {confirm === e.id ? (
                    <><button className="text-red-600 mr-2" onClick={() => { setConfirm(null); onDelete(e); }}>Confirm delete</button>
                      <button onClick={() => setConfirm(null)}>Cancel</button></>
                  ) : (
                    <><button className="text-[#356D65] mr-3" onClick={() => onEdit(e)}>Edit</button>
                      <button className="text-red-600" onClick={() => setConfirm(e.id)}>Delete</button></>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="mt-2 text-xs text-[#356D65] underline" onClick={onAdd}>+ Add expense to this activity</button>
    </div>
  );
}

function MoneyInput({ value, onCommit, ariaLabel, allowZero }) {
  const [text, setText] = useState(String(Math.round(value)));
  const commit = () => {
    const v = Number(text.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(v) && (allowZero ? v >= 0 : v > 0)) onCommit(Math.round(v));
    else setText(String(Math.round(value)));
  };
  return (
    <input inputMode="numeric" aria-label={ariaLabel} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="w-32 text-right border border-transparent hover:border-[#F1CBB5] focus:border-[#356D65] rounded px-2 py-1 bg-transparent" />
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="bg-white rounded-xl border border-[#F1CBB5] p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${tone === "bad" ? "text-red-600" : "text-slate-800"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
