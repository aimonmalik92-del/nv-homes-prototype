import { useState } from "react";
import { Link } from "react-router-dom";
import PortalShell from "../components/PortalShell";
import { checklists } from "../api/endpoints";
import { useApi } from "../hooks/useApi";
import { CHECKLIST_STATUS } from "../components/checklistStatus";

// Checklist summary: replaces the summary view of quality-checklist.html.

const STATUS = CHECKLIST_STATUS;

export default function QualityChecklists() {
  return <PortalShell title="Quality Checklists">{(project) => <Summary key={project.id} projectId={project.id} />}</PortalShell>;
}

function Summary({ projectId }) {
  const q = useApi((signal) => checklists.summary(projectId, { signal }), [projectId]);
  const [phase, setPhase] = useState("");
  const [status, setStatus] = useState("");
  if (q.error) return <p role="alert" className="text-red-600">Couldn't load checklists: {q.error.message}</p>;
  if (!q.data) return <p className="text-slate-500">Loading checklists…</p>;
  const d = q.data;
  const phases = [...new Set(d.activities.map((a) => a.phase))];
  const rows = d.activities.filter((a) => (!phase || a.phase === phase) && (!status || a.status === status));

  return (
    <div className="space-y-5">
      <SiteInfo projectId={projectId} info={d.info} onSaved={q.reload} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Overall progress" value={`${Math.round(d.totals.progress * 100)}%`} />
        <Stat label="Completed" value={`${d.by_status.completed} / ${d.activity_count}`} />
        <Stat label="In progress" value={d.by_status.in_progress} />
        <Stat label="Items failed (No)" value={d.totals.no} bad={d.totals.no > 0} />
        <Stat label="CM checked" value={`${d.cm_checked} / ${d.activity_count}`} />
      </div>
      <div className="bg-white rounded-2xl border border-[#F1CBB5] overflow-x-auto">
        <div className="flex flex-wrap gap-3 p-4 border-b border-[#F1CBB5] text-sm">
          <select aria-label="Filter by phase" className="border border-[#F1CBB5] rounded-lg px-2 py-1.5" value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="">All phases</option>{phases.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select aria-label="Filter by status" className="border border-[#F1CBB5] rounded-lg px-2 py-1.5" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="ml-auto text-slate-500 self-center">{rows.length} checklists</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#F7ECDF] text-left text-xs text-slate-600"><tr>
            <th className="px-4 py-2">#</th><th className="px-2 py-2">Checklist</th><th className="px-2 py-2 text-center">Items</th>
            <th className="px-2 py-2 text-center">Yes</th><th className="px-2 py-2 text-center">No</th><th className="px-2 py-2 text-center">N/A</th>
            <th className="px-2 py-2 w-36">Progress</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">CM</th><th className="px-4 py-2" />
          </tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.activity_no} className="border-b border-[#F7ECDF] hover:bg-[#FBF6F0]">
                <td className="px-4 py-2 text-slate-500">{a.activity_no}</td>
                <td className="px-2 py-2"><div className="font-medium">{a.title}</div><div className="text-xs text-slate-500">{a.phase}{a.type === "R" ? " · receiving" : ""}</div></td>
                <td className="px-2 py-2 text-center">{a.total}</td><td className="px-2 py-2 text-center">{a.yes}</td>
                <td className={`px-2 py-2 text-center ${a.no ? "text-red-600 font-medium" : ""}`}>{a.no}</td><td className="px-2 py-2 text-center">{a.na}</td>
                <td className="px-2 py-2"><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#356D65]" style={{ width: `${Math.round(a.progress * 100)}%` }} /></div></td>
                <td className="px-2 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[a.status].cls}`}>{STATUS[a.status].label}</span></td>
                <td className="px-2 py-2">{a.cm_checked || "—"}</td>
                <td className="px-4 py-2 text-right"><Link className="text-[#356D65] underline" to={`/checklists/${a.activity_no}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SiteInfo({ projectId, info, onSaved }) {
  const [f, setF] = useState({ site_id: info.site_id || "", client_name: info.client_name || "", site_engineer: info.site_engineer || "",
    construction_manager: info.construction_manager || "", start_date: info.start_date || "" });
  const [msg, setMsg] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    setMsg("Saving…");
    try {
      await checklists.updateInfo(projectId, { ...f, start_date: f.start_date || null });
      setMsg("Saved");
      onSaved();
    } catch (err) { setMsg(err.message); }
  };
  const field = (k, label, type = "text") => (
    <label className="text-xs text-slate-600 flex flex-col gap-1">{label}
      <input type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="border border-[#F1CBB5] rounded-lg px-2 py-1.5 text-sm" />
    </label>
  );
  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-[#F1CBB5] p-4 grid grid-cols-2 lg:grid-cols-6 gap-3 items-end" aria-label="Site information">
      {field("site_id", "Site ID")}{field("client_name", "Client name")}{field("site_engineer", "Site engineer (SE)")}
      {field("construction_manager", "Construction manager (CM)")}{field("start_date", "Start date", "date")}
      <div className="flex items-center gap-2"><button className="bg-[#356D65] text-white rounded-lg px-4 py-1.5 text-sm">Save</button><span className="text-xs text-slate-500" role="status">{msg}</span></div>
    </form>
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
