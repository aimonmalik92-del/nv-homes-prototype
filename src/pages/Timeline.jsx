import { useState } from "react";
import { Link } from "react-router-dom";
import PortalShell from "../components/PortalShell";
import { schedule } from "../api/endpoints";
import { useApi } from "../hooks/useApi";

// Project timeline / Gantt: replaces progress-timeline.html. The schedule
// (dates, float, critical path, baseline) is computed by the API; this page
// only draws it and sends edits back with PATCH.

const ROW_H = 40;
const ZOOM = { week: 7, month: 2.4 }; // pixels per day
const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QC = { completed: "✓ QC done", in_progress: "QC in progress", not_started: "" };

const toDay = (iso) => Date.parse(`${iso}T00:00:00Z`) / DAY;
const fmt = (iso) => (iso ? `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(2, 4)}` : "—");

export default function Timeline() {
  return <PortalShell title="Project Timeline">{(project) => <TimelineView key={project.id} projectId={project.id} />}</PortalShell>;
}

function TimelineView({ projectId }) {
  const q = useApi((signal) => schedule.get(projectId, { signal }), [projectId]);
  const [override, setOverride] = useState(null);
  const [zoom, setZoom] = useState("week");
  const [showBaseline, setShowBaseline] = useState(true);
  const [closed, setClosed] = useState({});
  const [msg, setMsg] = useState(null);
  const [confirmBaseline, setConfirmBaseline] = useState(false);
  const s = override ?? q.data;

  if (q.error) return <p role="alert" className="text-red-600">Couldn't load the schedule: {q.error.message}</p>;
  if (!s) return <p className="text-slate-500">Loading schedule…</p>;

  const run = async (fn, okText) => {
    setMsg({ text: "Saving…" });
    try { setOverride(await fn()); setMsg({ text: okText ?? "Saved" }); return true; }
    catch (e) { setMsg({ text: e.message, error: true }); return false; }
  };

  // ---- rows: phase summary, its activities (unless collapsed), then milestones per part
  const rows = [];
  for (const part of ["grey", "finishing"]) {
    for (const ph of s.phases.filter((p) => p.part === part)) {
      rows.push({ kind: "phase", ...ph });
      if (!closed[ph.phase]) ph.activity_nos.forEach((n) => rows.push({ kind: "act", ...s.activities[n - 1] }));
    }
    const ms = s.milestones.find((m) => m.key === `${part}_complete`);
    rows.push({ kind: "ms", ...ms });
  }

  // ---- time scale
  const all = s.activities.flatMap((a) => [a.start, a.finish, a.baseline_start, a.baseline_finish]).concat(s.project_start, s.data_date);
  const lo = Math.min(...all.map(toDay)) - 3;
  const hi = Math.max(...all.map(toDay)) + 10;
  const ppd = ZOOM[zoom];
  const width = Math.round((hi - lo) * ppd) + 180; // room for the date label after the last bar
  const x = (iso) => (toDay(iso) - lo) * ppd;
  const months = [];
  for (let d = new Date(lo * DAY); d.getTime() / DAY <= hi; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) {
    const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).getTime() / DAY;
    if (first >= lo) months.push({ key: first, left: (first - lo) * ppd, label: `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}` });
  }

  const v = s.finish_variance_days;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Forecast completion" value={fmt(s.project_finish)} />
        <Stat label="Baseline completion" value={fmt(s.baseline_finish)} />
        <Stat label="Variance" value={v > 0 ? `${v} days late` : v < 0 ? `${-v} days early` : "On baseline"} bad={v > 0} />
        <Stat label="Overall progress" value={`${s.overall.percent_complete}%`} />
        <Stat label="Critical activities" value={s.activities.filter((a) => a.critical).length} />
      </div>

      <div className="bg-white rounded-2xl border border-[#F1CBB5] p-4 flex flex-wrap items-end gap-4 text-sm">
        <DateField label="Project start" value={s.project_start} onChange={(d) => run(() => schedule.updateSettings(projectId, { project_start: d }))} />
        <DateField label="Data date (status as of)" value={s.data_date} onChange={(d) => run(() => schedule.updateSettings(projectId, { data_date: d }))} />
        <label className="flex flex-col gap-1 text-xs text-slate-600">Zoom
          <select value={zoom} onChange={(e) => setZoom(e.target.value)} className="border border-[#F1CBB5] rounded-lg px-2 py-1.5 text-sm">
            <option value="week">Weeks</option><option value="month">Months</option>
          </select>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={showBaseline} onChange={(e) => setShowBaseline(e.target.checked)} /> Show baseline</label>
        {confirmBaseline ? (
          <span className="flex items-center gap-2">Replace the baseline with the current forecast?
            <button className="px-3 py-1 rounded-lg bg-[#356D65] text-white" onClick={() => { setConfirmBaseline(false); run(() => schedule.rebaseline(projectId), "Baseline updated"); }}>Update</button>
            <button className="px-3 py-1 rounded-lg border border-[#F1CBB5]" onClick={() => setConfirmBaseline(false)}>Cancel</button>
          </span>
        ) : <button className="px-3 py-1.5 rounded-lg border border-[#F1CBB5]" onClick={() => setConfirmBaseline(true)}>Update baseline</button>}
        <span className={`ml-auto text-xs ${msg?.error ? "text-red-600" : "text-slate-500"}`} role="status" aria-live="polite">{msg?.text}</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#F1CBB5] flex overflow-hidden" role="region" aria-label="Gantt chart">
        {/* left: editable grid */}
        <div className="shrink-0 w-[640px] border-r border-[#F1CBB5] text-sm">
          <div className="grid grid-cols-[32px_1fr_56px_96px_56px_118px_118px] items-center h-10 bg-[#F7ECDF] text-xs text-slate-600 px-2 gap-1">
            <span>#</span><span>Activity</span><span>Days</span><span>Predecessors</span><span>%</span><span>Actual start</span><span>Actual finish</span>
          </div>
          {rows.map((r) => r.kind === "phase" ? (
            <button key={`p-${r.phase}`} onClick={() => setClosed((c) => ({ ...c, [r.phase]: !c[r.phase] }))} aria-expanded={!closed[r.phase]}
              className="w-full h-10 px-2 flex items-center gap-2 bg-[#FBF6F0] border-b border-[#F7ECDF] text-left font-medium">
              <span>{closed[r.phase] ? "▸" : "▾"}</span>{r.phase}<span className="ml-auto text-xs text-slate-500">{r.percent_complete}%</span>
            </button>
          ) : r.kind === "ms" ? (
            <div key={`m-${r.key}`} className="h-10 px-2 flex items-center gap-2 border-b border-[#F7ECDF] font-medium">◆ {r.name}<span className="ml-auto text-xs text-slate-500">{fmt(r.date)}</span></div>
          ) : (
            <ActivityRow key={`a-${r.activity_no}-${r.duration_days}-${r.predecessors}-${r.percent_complete}-${r.actual_start}-${r.actual_finish}`} a={r}
              onPatch={(changes) => run(() => schedule.updateActivity(projectId, r.activity_no, changes))} />
          ))}
        </div>

        {/* right: bars */}
        <div className="overflow-x-auto flex-1">
          <div className="relative" style={{ width }}>
            <div className="h-10 bg-[#F7ECDF] relative text-xs text-slate-600">
              {months.map((m) => <span key={m.key} className="absolute top-3" style={{ left: m.left + 4 }}>{m.label}</span>)}
            </div>
            <div className="relative" style={{ height: rows.length * ROW_H }}>
              {months.map((m) => <div key={m.key} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: m.left }} />)}
              <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-sky-500" style={{ left: x(s.data_date) }} title={`Data date ${fmt(s.data_date)}`} />
              {rows.map((r, i) => {
                const top = i * ROW_H;
                if (r.kind === "ms") return <Diamond key={`m-${r.key}`} top={top} left={x(r.date)} done={r.done} label={fmt(r.date)} />;
                if (r.kind === "phase") {
                  const l = x(r.start), w = Math.max(4, x(r.finish) - l + ppd);
                  return <div key={`p-${r.phase}`} className="absolute h-2 bg-slate-700 rounded" style={{ top: top + 16, left: l, width: w }} title={`${r.phase}: ${fmt(r.start)} – ${fmt(r.finish)}`} />;
                }
                const l = x(r.start), w = Math.max(ppd, x(r.finish) - l + ppd);
                const bl = x(r.baseline_start), bw = Math.max(ppd, x(r.baseline_finish) - bl + ppd);
                const color = r.status === "done" ? "bg-emerald-500" : r.critical ? "bg-red-500" : "bg-[#356D65]";
                return (
                  <div key={`a-${r.activity_no}`}>
                    {showBaseline && <div className="absolute h-1.5 bg-slate-300 rounded" style={{ top: top + 28, left: bl, width: bw }} title={`Baseline ${fmt(r.baseline_start)} – ${fmt(r.baseline_finish)}`} />}
                    <div className={`absolute h-4 rounded ${color} bg-opacity-30 overflow-hidden`} style={{ top: top + 8, left: l, width: w, opacity: 0.9 }}
                      title={`${r.activity_no}. ${r.title}: ${fmt(r.start)} – ${fmt(r.finish)} · ${r.percent_complete}% · float ${r.total_float_days}d${r.critical ? " · critical" : ""}`}>
                      <div className="h-full bg-black/25" style={{ width: `${r.percent_complete}%` }} />
                    </div>
                    <span className="absolute text-[11px] text-slate-600 whitespace-nowrap" style={{ top: top + 8, left: l + w + 6 }}>
                      {fmt(r.finish)}{r.finish_variance_days > 0 ? ` (+${r.finish_variance_days}d)` : ""} {QC[r.qc_status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Bars: <span className="text-red-600">red = critical path</span>, green = done, teal = other; darker part = % complete; grey line = baseline;
        dashed blue line = data date. Predecessors are finish-to-start: “14”, “14-10” (start 10 days before 14 finishes), “18+30”.
        QC status comes from the <Link to="/checklists" className="underline">quality checklists</Link>.
      </p>
    </div>
  );
}

function ActivityRow({ a, onPatch }) {
  const [f, setF] = useState({ duration_days: String(a.duration_days), predecessors: a.predecessors, percent_complete: String(a.percent_complete),
    actual_start: a.actual_start ?? "", actual_finish: a.actual_finish ?? "" });
  const commit = async (key, value) => {
    const changes = key === "duration_days" || key === "percent_complete" ? { [key]: Number(value) } : { [key]: value === "" && key.startsWith("actual") ? null : value };
    const ok = await onPatch(changes);
    if (!ok) setF((s) => ({ ...s, [key]: key === "duration_days" ? String(a.duration_days) : key === "percent_complete" ? String(a.percent_complete) : (a[key] ?? "") }));
  };
  const input = (key, { label, ...props }) => (
    <input {...props} aria-label={`${label} for activity ${a.activity_no}`} value={f[key]}
      onChange={(e) => setF((s) => ({ ...s, [key]: e.target.value }))}
      onBlur={() => String(f[key]) !== String(key.startsWith("actual") ? a[key] ?? "" : a[key]) && commit(key, f[key])}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="w-full min-w-0 border border-transparent hover:border-[#F1CBB5] focus:border-[#356D65] rounded px-1 py-0.5 text-xs bg-transparent" />
  );
  return (
    <div className={`grid grid-cols-[32px_1fr_56px_96px_56px_118px_118px] items-center h-10 px-2 gap-1 border-b border-[#F7ECDF] ${a.critical ? "bg-red-50/40" : ""}`}>
      <span className="text-slate-500 text-xs">{a.activity_no}</span>
      <span className="truncate text-xs" title={`${a.title} · float ${a.total_float_days} days`}>{a.title}</span>
      {input("duration_days", { label: "Duration", inputMode: "numeric" })}
      {input("predecessors", { label: "Predecessors", placeholder: "—" })}
      {input("percent_complete", { label: "Percent complete", inputMode: "numeric" })}
      {input("actual_start", { label: "Actual start", type: "date" })}
      {input("actual_finish", { label: "Actual finish", type: "date" })}
    </div>
  );
}

function Diamond({ top, left, done, label }) {
  return (
    <div className="absolute flex items-center gap-2" style={{ top: top + 12, left: left - 8 }}>
      <div className={`w-4 h-4 rotate-45 ${done ? "bg-emerald-500" : "bg-slate-800"}`} />
      <span className="text-[11px] text-slate-700">{label}</span>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">{label}
      <input type="date" defaultValue={value} key={value} onBlur={(e) => e.target.value && e.target.value !== value && onChange(e.target.value)}
        className="border border-[#F1CBB5] rounded-lg px-2 py-1.5 text-sm" />
    </label>
  );
}

function Stat({ label, value, bad }) {
  return (
    <div className="bg-white rounded-xl border border-[#F1CBB5] p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${bad ? "text-red-600" : ""}`}>{value}</div>
    </div>
  );
}
