import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PortalShell from "../components/PortalShell";
import { checklists } from "../api/endpoints";
import { useApi } from "../hooks/useApi";
import { CHECKLIST_STATUS as STATUS } from "../components/checklistStatus";

// One activity's checklist: replaces the detail view of quality-checklist.html.
// Every change autosaves with PATCH /api/projects/{id}/checklists/{no}.

const VALUE_STYLE = { Yes: "bg-emerald-50 text-emerald-700", No: "bg-red-50 text-red-700", "N/A": "bg-slate-100 text-slate-600" };
const LAST = 25;

export default function ChecklistDetail() {
  const { no } = useParams();
  return (
    <PortalShell title="Quality Checklist">
      {(project) => <Detail key={`${project.id}-${no}`} projectId={project.id} no={Number(no)} />}
    </PortalShell>
  );
}

function Detail({ projectId, no }) {
  const q = useApi((signal) => checklists.get(projectId, no, { signal }), [projectId, no]);
  const [saving, setSaving] = useState(null);
  const [data, setData] = useState(null);
  const c = data ?? q.data;

  if (q.error) return <p role="alert" className="text-red-600">{q.error.status === 404 ? "There is no checklist with that number." : q.error.message}</p>;
  if (!c) return <p className="text-slate-500">Loading checklist…</p>;

  const patch = async (changes) => {
    setSaving("Saving…");
    try {
      setData(await checklists.patch(projectId, no, changes));
      setSaving("All changes saved");
    } catch (e) {
      setSaving(`Not saved: ${e.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link to="/checklists" className="text-[#356D65] underline">← All checklists</Link>
        <span className="text-slate-400">|</span>
        {no > 1 && <Link to={`/checklists/${no - 1}`} className="text-[#356D65]">‹ Previous</Link>}
        {no < LAST && <Link to={`/checklists/${no + 1}`} className="text-[#356D65]">Next ›</Link>}
        <span className="ml-auto text-xs text-slate-500" role="status" aria-live="polite">{saving}</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#F1CBB5]">
        <div className="p-4 border-b border-[#F1CBB5]">
          <div className="text-xs text-slate-500">{c.phase} · Activity {c.activity_no}{c.type === "R" ? " · receiving checklist" : ""}</div>
          <h2 className="text-lg font-semibold">{c.title}</h2>
          <p className="text-sm text-slate-600">{c.heading}</p>
          <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-4">
            <span>Site ID: {c.info.site_id || "—"}</span><span>Client: {c.info.client_name || "—"}</span>
            <span>SE: {c.info.site_engineer || "—"}</span><span>CM: {c.info.construction_manager || "—"}</span>
            <span className={`px-2 rounded-full ${STATUS[c.stats.status].cls}`}>{STATUS[c.stats.status].label} · {Math.round(c.stats.progress * 100)}%</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#F7ECDF] text-left text-xs text-slate-600"><tr>
            <th className="px-4 py-2 w-10">#</th><th className="px-2 py-2">Check</th><th className="px-2 py-2 w-28">Status</th><th className="px-4 py-2 w-1/3">Remarks</th>
          </tr></thead>
          <tbody>
            {c.items.map((it) => (
              <tr key={it.index} className="border-b border-[#F7ECDF]">
                <td className="px-4 py-2 text-slate-500">{it.index + 1}</td>
                <td className="px-2 py-2">{it.text}</td>
                <td className="px-2 py-2">
                  <select aria-label={`Status for item ${it.index + 1}`} value={it.value ?? ""}
                    onChange={(e) => patch({ items: [{ index: it.index, value: e.target.value || null }] })}
                    className={`border border-[#F1CBB5] rounded-lg px-2 py-1 ${VALUE_STYLE[it.value] ?? ""}`}>
                    <option value="">—</option><option>Yes</option><option>No</option><option>N/A</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <BlurInput ariaLabel={`Remark for item ${it.index + 1}`} value={it.remark} maxLength={500}
                    onCommit={(v) => patch({ items: [{ index: it.index, remark: v }] })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 grid lg:grid-cols-3 gap-4 text-sm">
          <label className="flex flex-col gap-1 text-xs text-slate-600">Inspection date
            <input type="date" value={c.inspection_date ?? ""} onChange={(e) => patch({ inspection_date: e.target.value || null })} className="border border-[#F1CBB5] rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">CM review done
            <select value={c.cm_checked ?? ""} onChange={(e) => patch({ cm_checked: e.target.value || null })} className="border border-[#F1CBB5] rounded-lg px-2 py-1.5 text-sm">
              <option value="">—</option><option>Yes</option><option>No</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">Remarks
            <BlurInput ariaLabel="Checklist remarks" value={c.remarks} maxLength={2000} onCommit={(v) => patch({ remarks: v })} boxed />
          </label>
        </div>
        <div className="p-4 pt-0 grid sm:grid-cols-3 gap-4">
          {c.signature_roles.map((r) => (
            <label key={r.key} className="border border-[#F1CBB5] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-xs font-semibold">{r.title}</span><span className="text-xs text-slate-500">{r.hint}</span>
              <BlurInput ariaLabel={`${r.title} signature`} value={c.signatures[r.key] ?? ""} maxLength={120} placeholder="Name / sign" boxed
                onCommit={(v) => patch({ signatures: { [r.key]: v || null } })} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlurInput({ value, onCommit, ariaLabel, maxLength, placeholder, boxed }) {
  const [text, setText] = useState(value ?? "");
  return (
    <input aria-label={ariaLabel} value={text} maxLength={maxLength} placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => text !== (value ?? "") && onCommit(text)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className={`w-full rounded-lg px-2 py-1 text-sm ${boxed ? "border border-[#F1CBB5]" : "border border-transparent hover:border-[#F1CBB5] focus:border-[#356D65]"}`} />
  );
}
