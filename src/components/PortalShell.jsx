import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../api/endpoints";
import { useCurrentProject } from "../hooks/useCurrentProject";
import LoginPanel from "./LoginPanel";
import ImportBanner from "./ImportBanner";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/budget", label: "Budget" },
  { to: "/checklists", label: "Quality Checklists" },
  { to: "/timeline", label: "Timeline" },
  { to: "/budget-calculator", label: "Calculator" },
];

/**
 * Layout for signed-in portal pages: sign-in gate, project picker, top nav and
 * the one-time import banner. Renders children(project) once a project is ready.
 */
export default function PortalShell({ title, children }) {
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn());
  useEffect(() => { document.title = `${title} · NV Homes`; }, [title]);
  if (!loggedIn) return <LoginPanel onDone={() => setLoggedIn(true)} />;
  return <SignedIn title={title} onSignOut={() => { auth.logout(); setLoggedIn(false); }}>{children}</SignedIn>;
}

function SignedIn({ title, onSignOut, children }) {
  const current = useCurrentProject(true);
  const [name, setName] = useState("My House");
  const unauthorized = current.error?.status === 401;
  useEffect(() => { if (unauthorized) onSignOut(); }, [unauthorized, onSignOut]);

  let body;
  if (current.error && !unauthorized) body = <p role="alert" className="text-red-600">Couldn't load your projects: {current.error.message}</p>;
  else if (current.loading || unauthorized) body = <p className="text-slate-500">Loading…</p>;
  else if (!current.project) {
    body = (
      <form className="bg-white rounded-2xl border border-[#F1CBB5] p-6 space-y-3 max-w-sm" onSubmit={(e) => { e.preventDefault(); current.create(name); }}>
        <h2 className="font-semibold">Create your first project</h2>
        <input aria-label="Project name" className="w-full border border-[#F1CBB5] rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="w-full bg-[#356D65] text-white rounded-lg py-2">Create project</button>
      </form>
    );
  } else {
    body = (
      <>
        <ImportBanner projectId={current.project.id} />
        {children(current.project)}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6F0] text-slate-800">
      <header className="bg-white border-b border-[#F1CBB5]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="w-8 h-8 bg-[#356D65] rounded-lg grid place-items-center text-white text-xs">NV</span>NV HOMES
          </NavLink>
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="Portal">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/checklists" ? false : undefined}
                className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? "bg-[#356D65] text-white" : "text-slate-600 hover:bg-[#F7ECDF]"}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {current.list.length > 1 ? (
              <select aria-label="Project" className="border border-[#F1CBB5] rounded-lg px-2 py-1"
                value={current.project?.id ?? ""} onChange={(e) => current.select(Number(e.target.value))}>
                {current.list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : current.project && <span className="text-slate-600">{current.project.name}</span>}
            <button onClick={onSignOut} className="text-[#356D65] underline">Sign out</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">{title}</h1>
        {body}
      </main>
    </div>
  );
}
