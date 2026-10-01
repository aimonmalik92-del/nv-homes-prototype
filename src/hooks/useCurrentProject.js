import { useEffect, useState } from "react";
import { projects } from "../api/endpoints";

const KEY = "nvhomes.projectId";

/** Picks the signed-in user's project: ?project=<id>, the last one used, or the first. */
export function useCurrentProject(enabled) {
  const [state, setState] = useState({ project: null, list: [], loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    const ctrl = new AbortController();
    projects.list({ signal: ctrl.signal })
      .then((list) => {
        const wanted = new URLSearchParams(window.location.search).get("project") ?? (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
        const project = list.find((p) => String(p.id) === String(wanted)) ?? list[0] ?? null;
        setState({ project, list, loading: false, error: null });
      })
      .catch((error) => { if (!ctrl.signal.aborted) setState((s) => ({ ...s, loading: false, error })); });
    return () => ctrl.abort();
  }, [enabled]);

  useEffect(() => {
    if (state.project) { try { localStorage.setItem(KEY, String(state.project.id)); } catch { /* ignore */ } }
  }, [state.project]);

  const create = async (name) => {
    const project = await projects.create(name);
    setState((s) => ({ ...s, project, list: [...s.list, project] }));
  };
  return { ...state, create };
}
