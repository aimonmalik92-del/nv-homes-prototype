import { useState } from "react";
import { auth } from "../api/endpoints";

/** Email/password sign-in + sign-up against /api/auth. */
export default function LoginPanel({ onDone }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await auth.login(form.email, form.password);
      else await auth.register(form.name, form.email, form.password);
      onDone?.();
    } catch (err) {
      setError(err.errors ? err.errors.map((x) => x.msg).join(" · ") : err.message);
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full border border-[#F1CBB5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#356D65]";
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7ECDF] p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-[#F1CBB5] p-6 w-full max-w-sm space-y-3 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">{mode === "login" ? "Sign in to NV Homes" : "Create your account"}</h1>
        {mode === "register" && <input className={input} placeholder="Full name" value={form.name} onChange={set("name")} required autoComplete="name" />}
        <input className={input} type="email" placeholder="Email" value={form.email} onChange={set("email")} required autoComplete="email" />
        <input className={input} type="password" placeholder="Password (8+ characters)" value={form.password} onChange={set("password")} required minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button disabled={busy} className="w-full bg-[#356D65] hover:bg-[#2a574f] text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button type="button" className="w-full text-xs text-[#356D65]" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
