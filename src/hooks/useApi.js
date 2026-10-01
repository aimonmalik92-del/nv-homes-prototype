import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader, tracks {data, error, loading}, cancels on unmount or
 * when deps change, and exposes reload() for after a mutation. Previous data
 * stays visible while reloading.
 *   const { data, error, loading, reload } = useApi((signal) => budget.get(id, { signal }), [id]);
 * Pass enabled=false to skip (e.g. until a project id is known).
 */
export function useApi(loader, deps, { enabled = true } = {}) {
  const [tick, setTick] = useState(0);
  const key = JSON.stringify([...deps, tick]);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    const ctrl = new AbortController();
    loader(ctrl.signal)
      .then((data) => { if (!ctrl.signal.aborted) setResult({ key, data, error: null }); })
      .catch((error) => { if (!ctrl.signal.aborted) setResult((r) => ({ key, data: r.data, error })); });
    return () => ctrl.abort();
    // `loader` is re-created every render; `key` captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const fresh = result.key === key;
  return { data: result.data, error: fresh ? result.error : null, loading: enabled && !fresh, reload };
}
