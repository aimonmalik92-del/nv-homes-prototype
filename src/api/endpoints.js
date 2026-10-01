/**
 * One function per backend endpoint. Pages import from here, never call
 * fetch directly, so a URL or payload change is a one-file edit.
 * Full schemas: http://localhost:8000/docs
 */
import { request, tokenStore } from "./client";

const p = (projectId) => `/api/projects/${encodeURIComponent(projectId)}`;

// --- auth ---------------------------------------------------------------
export const auth = {
  async login(email, password) {
    const { access_token } = await request("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
    tokenStore.set(access_token);
  },
  async register(name, email, password) {
    const { access_token } = await request("/api/auth/register", { method: "POST", body: { name, email, password }, auth: false });
    tokenStore.set(access_token);
  },
  me: (opts) => request("/api/auth/me", opts),
  logout: () => tokenStore.set(null),
  isLoggedIn: () => Boolean(tokenStore.get()),
};

// --- reference data + calculator (public) ----------------------------------
export const catalog = {
  activities: (part, opts) => request("/api/catalog/activities", { query: { part }, auth: false, ...opts }),
};

export const calculator = {
  options: (opts) => request("/api/calculator/options", { auth: false, ...opts }),
  /** @param {{plot_marla:number, city:string, floors:number, package:string, boundary_wall?:boolean, car_porch?:boolean}} input */
  estimate: (input, opts) => request("/api/calculator/estimate", { method: "POST", body: input, auth: false, ...opts }),
};

// --- projects --------------------------------------------------------------
export const projects = {
  list: (opts) => request("/api/projects", opts),
  create: (name, area_sqft) => request("/api/projects", { method: "POST", body: { name, area_sqft } }),
  get: (id, opts) => request(p(id), opts),
  overview: (id, opts) => request(`${p(id)}/overview`, opts),
};

// --- budget tracking ---------------------------------------------------------
export const budget = {
  get: (id, opts) => request(`${p(id)}/budget`, opts),
  setPartTotal: (id, part, total) => request(`${p(id)}/budget/parts/${part}`, { method: "PUT", body: { total } }),
  resetSplit: (id, part) => request(`${p(id)}/budget/parts/${part}/reset-split`, { method: "POST" }),
  setActivityBudget: (id, no, value) => request(`${p(id)}/budget/activities/${no}`, { method: "PUT", body: { budget: value } }),
  /** filters: {activity_no, part, from, to, q, limit, offset} */
  listExpenses: (id, filters, opts) => request(`${p(id)}/budget/expenses`, { query: filters, ...opts }),
  createExpense: (id, expense) => request(`${p(id)}/budget/expenses`, { method: "POST", body: expense }),
  updateExpense: (id, expenseId, changes) => request(`${p(id)}/budget/expenses/${expenseId}`, { method: "PATCH", body: changes }),
  deleteExpense: (id, expenseId) => request(`${p(id)}/budget/expenses/${expenseId}`, { method: "DELETE" }),
  uploadBill: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`${p(id)}/expenses/upload-bill`, { method: "POST", body: form });
  },
};

// --- quality checklists -------------------------------------------------------
export const checklists = {
  summary: (id, opts) => request(`${p(id)}/checklists`, opts),
  get: (id, no, opts) => request(`${p(id)}/checklists/${no}`, opts),
  save: (id, no, body) => request(`${p(id)}/checklists/${no}`, { method: "PUT", body }),
  patch: (id, no, changes) => request(`${p(id)}/checklists/${no}`, { method: "PATCH", body: changes }),
  updateInfo: (id, info) => request(`${p(id)}/checklists/info`, { method: "PUT", body: info }),
};

// --- schedule ------------------------------------------------------------------
export const schedule = {
  get: (id, opts) => request(`${p(id)}/schedule`, opts),
  updateSettings: (id, body) => request(`${p(id)}/schedule`, { method: "PATCH", body }),
  updateActivity: (id, no, changes) => request(`${p(id)}/schedule/activities/${no}`, { method: "PATCH", body: changes }),
  rebaseline: (id) => request(`${p(id)}/schedule/baseline`, { method: "POST" }),
};

// --- AI assistant ----------------------------------------------------------------
export const assistant = {
  ask: (question, projectId) => request("/api/assistant/query", { method: "POST", body: { question, project_id: projectId } }),
};

// --- one-time import of the old static pages' browser data ------------------------
export const importer = {
  browserData: (id, payload) => request(`${p(id)}/import/browser-data`, { method: "POST", body: payload }),
};
