import { useMemo, useState } from "react";
import { budget } from "../api/endpoints";

const CATEGORIES = ["Material", "Labour", "Equipment / Machinery", "Transport", "Subcontractor", "Other"];
const MODES = ["Cash", "Bank transfer", "Cheque", "Credit (unpaid)"];
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Add / edit an expense against one of the 25 activities.
 * `activities` = budget.parts[].activities from GET /budget.
 */
export default function ExpenseForm({ projectId, activities, initial, defaultActivity, onClose, onSaved }) {
  const [f, setF] = useState(() => ({
    activity_no: initial?.activity_no ?? defaultActivity ?? activities[0]?.activity_no,
    expense_date: initial?.expense_date ?? today(),
    category: initial?.category ?? "Material",
    description: initial?.description ?? "",
    vendor: initial?.vendor ?? "",
    bill_no: initial?.bill_no ?? "",
    quantity: initial?.quantity ?? "",
    unit: initial?.unit ?? "",
    rate: initial?.rate ?? "",
    amount: initial?.amount ?? "",
    payment_mode: initial?.payment_mode ?? "Cash",
    notes: initial?.notes ?? "",
  }));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => {
    const next = { ...s, [k]: e.target.value };
    if ((k === "quantity" || k === "rate") && Number(next.quantity) > 0 && Number(next.rate) > 0) {
      next.amount = Math.round(Number(next.quantity) * Number(next.rate));
    }
    return next;
  });

  const groups = useMemo(() => ({
    grey: activities.filter((a) => a.part === "grey"),
    finishing: activities.filter((a) => a.part === "finishing"),
  }), [activities]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const num = (v) => (v === "" || v === null ? null : Number(v));
    const body = {
      ...f, activity_no: Number(f.activity_no), amount: Number(f.amount),
      quantity: num(f.quantity), rate: num(f.rate),
      vendor: f.vendor || null, bill_no: f.bill_no || null, unit: f.unit || null, notes: f.notes || null,
    };
    try {
      const saved = initial ? await budget.updateExpense(projectId, initial.id, body) : await budget.createExpense(projectId, body);
      onSaved?.(saved);
    } catch (err) {
      setError(err.errors ? err.errors.map((x) => `${x.loc.at(-1)}: ${x.msg}`).join(" · ") : err.message);
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full border border-[#F1CBB5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#356D65]";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="bg-white rounded-2xl p-5 w-full max-w-lg space-y-3 max-h-[90vh] overflow-auto" aria-label="Expense">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">{initial ? "Edit expense" : "Add new expense"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-500">✕</button>
        </div>
        <label className="block text-xs text-slate-600">Activity
          <select className={input} value={f.activity_no} onChange={set("activity_no")}>
            <optgroup label="Grey Work">{groups.grey.map((a) => <option key={a.activity_no} value={a.activity_no}>{a.activity_no}. {a.title}</option>)}</optgroup>
            <optgroup label="Finishing Work">{groups.finishing.map((a) => <option key={a.activity_no} value={a.activity_no}>{a.activity_no}. {a.title}</option>)}</optgroup>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-600">Date<input type="date" className={input} value={f.expense_date} onChange={set("expense_date")} required /></label>
          <label className="block text-xs text-slate-600">Category
            <select className={input} value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
        </div>
        <label className="block text-xs text-slate-600">Description<input className={input} value={f.description} onChange={set("description")} required maxLength={500} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-600">Vendor<input className={input} value={f.vendor} onChange={set("vendor")} maxLength={200} /></label>
          <label className="block text-xs text-slate-600">Bill no.<input className={input} value={f.bill_no} onChange={set("bill_no")} maxLength={100} /></label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input className={input} inputMode="decimal" placeholder="Qty" aria-label="Quantity" value={f.quantity} onChange={set("quantity")} />
          <input className={input} placeholder="Unit" aria-label="Unit" value={f.unit} onChange={set("unit")} maxLength={30} />
          <input className={input} inputMode="decimal" placeholder="Rate (Rs)" aria-label="Rate" value={f.rate} onChange={set("rate")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-600">Amount (Rs)<input className={input} inputMode="decimal" value={f.amount} onChange={set("amount")} required /></label>
          <label className="block text-xs text-slate-600">Payment mode
            <select className={input} value={f.payment_mode} onChange={set("payment_mode")}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
          </label>
        </div>
        <label className="block text-xs text-slate-600">Notes<textarea className={input} rows={2} value={f.notes} onChange={set("notes")} maxLength={2000} /></label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-[#F1CBB5]">Cancel</button>
          <button disabled={busy} className="text-sm px-4 py-2 rounded-lg bg-[#356D65] text-white disabled:opacity-60">{busy ? "Saving…" : "Save expense"}</button>
        </div>
      </form>
    </div>
  );
}
