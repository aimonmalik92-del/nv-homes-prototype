import { useEffect, useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { assistant, auth, budget, checklists as checklistApi, projects, schedule as scheduleApi } from '../api/endpoints'
import { formatLacs, formatRs } from '../api/format'
import { useApi } from '../hooks/useApi'
import { useCurrentProject } from '../hooks/useCurrentProject'
import LoginPanel from '../components/LoginPanel'
import ExpenseForm from '../components/ExpenseForm'

// All figures on this page come from the API:
//   GET /api/projects/{id}/budget      activity budgets + spend
//   GET /api/projects/{id}/schedule    % complete + checklist status per activity
//   GET /api/projects/{id}/overview    sidebar KPIs + recent expenses
//   GET /api/projects/{id}/checklists  quality summary

const QC_LABEL = { completed: 'PASS', in_progress: 'IN PROGRESS', not_started: 'PENDING' }
const lacNum = (n) => ((n || 0) / 100000).toFixed(1)

function Centered({ children }) {
  return <div className="min-h-screen flex items-center justify-center bg-[#F7ECDF] p-6 text-sm text-slate-700">{children}</div>
}

function ProjectBudgetTracking() {
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn())
  if (!loggedIn) return <LoginPanel onDone={() => setLoggedIn(true)} />
  return <Dashboard onSignOut={() => { auth.logout(); setLoggedIn(false) }} />
}

function Dashboard({ onSignOut }) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState('dashboard')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [asking, setAsking] = useState(false)
  const [newName, setNewName] = useState('My House')

  const current = useCurrentProject(true)
  const pid = current.project?.id
  const on = { enabled: Boolean(pid) }
  const budgetQ = useApi((signal) => budget.get(pid, { signal }), [pid], on)
  const schedQ = useApi((signal) => scheduleApi.get(pid, { signal }), [pid], on)
  const overviewQ = useApi((signal) => projects.overview(pid, { signal }), [pid], on)
  const qcQ = useApi((signal) => checklistApi.summary(pid, { signal }), [pid], on)

  const error = current.error || budgetQ.error || schedQ.error || overviewQ.error || qcQ.error
  // Expired or invalid token: back to the sign-in screen.
  useEffect(() => { if (error?.status === 401) onSignOut() }, [error, onSignOut])
  if (error?.status === 401) return null
  if (error) return <Centered><span role="alert">Couldn't load your project: {error.message}</span></Centered>
  if (current.loading) return <Centered>Loading your projects…</Centered>
  if (!current.project) {
    return (
      <Centered>
        <form className="bg-white rounded-2xl border border-[#F1CBB5] p-6 space-y-3 w-full max-w-sm"
          onSubmit={(e) => { e.preventDefault(); current.create(newName) }}>
          <h1 className="font-semibold text-slate-800">Create your first project</h1>
          <input className="w-full border border-[#F1CBB5] rounded-lg px-3 py-2" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <button className="w-full bg-[#356D65] text-white rounded-lg py-2">Create project</button>
        </form>
      </Centered>
    )
  }
  if (!budgetQ.data || !schedQ.data || !overviewQ.data || !qcQ.data) return <Centered>Loading project…</Centered>

  const ov = overviewQ.data
  const [grey, finishing] = budgetQ.data.parts
  const schedByNo = Object.fromEntries(schedQ.data.activities.map((a) => [a.activity_no, a]))
  const toRow = (part) => (a) => ({
    id: a.activity_no, part, activity_no: a.activity_no, title: a.title,
    name: `${a.activity_no}. ${a.title}`, category: a.phase,
    planned: a.budget, actual: a.spent,
    qc: QC_LABEL[schedByNo[a.activity_no]?.qc_status] ?? 'PENDING',
    progress: Math.round(schedByNo[a.activity_no]?.percent_complete ?? 0),
  })
  const greyWorkActivities = grey.activities.map(toRow('grey'))
  const finishingActivities = finishing.activities.map(toRow('finishing'))
  const allActivities = [...greyWorkActivities, ...finishingActivities]
  const variance = schedQ.data.finish_variance_days
  const qcRows = qcQ.data.activities.filter((a) => a.status !== 'not_started').slice(0, 3)

  const reloadAll = () => { budgetQ.reload(); overviewQ.reload(); schedQ.reload() }

  const ask = async () => {
    const question = query.trim()
    if (!question) return
    setAsking(true)
    try {
      const res = await assistant.ask(question, pid)
      setAnswer(res.answer ?? res.summary ?? JSON.stringify(res.result ?? res.records?.slice(0, 2) ?? res, null, 1))
    } catch (e) {
      setAnswer(`Sorry, the assistant failed: ${e.message}`)
    } finally {
      setAsking(false)
    }
  }

  const formatCurrency = (num) => {
    if (!num || num === 0) return '—'
    return `Rs ${num.toLocaleString('en-IN')}`
  }

  const getQcBadge = (status) => {
    if (status === 'PASS') return 'bg-emerald-100 text-emerald-700'
    if (status === 'IN PROGRESS' || status === 'QC HOLD') return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-600'
  }

  const currentActivities = view === 'grey-details' ? greyWorkActivities : finishingActivities
  const currentTitle = view === 'grey-details' ? 'Grey Work — Activity-Wise Budget & Progress' : 'Finishing Work — Activity-Wise Budget & Progress'
  const currentIcon = view === 'grey-details' ? '🏗️' : '🎨'
  const currentPart = view === 'grey-details' ? 'grey' : 'finishing'

  return (
    <div className="min-h-screen bg-white flex text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#F7ECDF] border-r border-[#F1CBB5] flex flex-col items-center py-4 gap-2 shrink-0">
        <div className="w-10 h-10 bg-[#356D65] rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3">NV</div>
        <div className="w-20 bg-[#356D65] text-white rounded-xl py-2.5 flex flex-col items-center gap-1 cursor-pointer">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-medium">New</span>
        </div>
        <div className="w-20 text-slate-600 rounded-xl py-2 flex flex-col items-center gap-1 cursor-pointer hover:bg-white transition">
          <span className="text-lg">📊</span>
          <span className="text-[10px] font-medium">Key Stats</span>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm mt-1">
          <div className="text-[#356D65] text-base">💰</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Total Budget</div>
          <div className="text-[11px] font-bold text-slate-800">{lacNum(ov.budget.total_budget)}</div>
          <div className="text-[9px] text-slate-500">Lacs</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-[#356D65] text-base">📈</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Total Spending</div>
          <div className="text-[11px] font-bold text-slate-800">{ov.budget.used_pct}%</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-[#356D65] text-base">🏦</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Budget Remaining</div>
          <div className="text-[11px] font-bold text-slate-800">{lacNum(ov.budget.remaining)}</div>
          <div className="text-[9px] text-slate-500">Lacs</div>
        </div>
        <div className="w-20 bg-[#356D65] text-white rounded-xl p-2 text-center shadow-sm">
          <div className="text-base">📊</div>
          <div className="text-[9px] mt-0.5 opacity-90">Overall Progress</div>
          <div className="text-[11px] font-bold">{variance > 0 ? `${variance}d late` : 'On Track'}</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-amber-500 text-base">⭐</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Quality Score</div>
          <div className="text-[11px] font-bold text-slate-800">{Math.round(ov.quality.progress * 100)}</div>
          <div className="text-[9px] text-slate-500">/ 100</div>
        </div>
        <div className="flex-1"></div>
        <div className="w-20 text-slate-600 rounded-xl py-2 flex flex-col items-center gap-1 cursor-pointer hover:bg-white transition">
          <span className="text-lg">🔔</span>
          <span className="text-[10px] font-medium">AI Alerts</span>
        </div>
        <div className="w-20 text-slate-600 rounded-xl py-2 flex flex-col items-center gap-1 cursor-pointer hover:bg-white transition">
          <span className="text-lg">📝</span>
          <span className="text-[10px] font-medium">Site Log</span>
        </div>
        <div className="w-20 text-slate-600 rounded-xl py-2 flex flex-col items-center gap-1 cursor-pointer hover:bg-white transition">
          <span className="text-lg">⚙️</span>
          <span className="text-[10px] font-medium">Settings</span>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="bg-white border-b border-[#F1CBB5] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#356D65] rounded-lg flex items-center justify-center text-white text-xs font-bold">NV</div>
              <span className="font-semibold text-slate-800">NV HOMES</span>
            </div>
            <span className="text-slate-500 text-sm">Client : {qcQ.data.info.client_name || '—'}</span>
          </div>
          <div className="bg-[#F7ECDF] text-[#356D65] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 border border-[#F1CBB5]">
            <span className="w-2 h-2 bg-[#356D65] rounded-full"></span>
            Project Monitoring & Control System
          </div>
          <div className="text-sm font-medium text-slate-700 flex items-center gap-3">{current.project.name}<button onClick={onSignOut} className="text-xs text-[#356D65] underline">Sign out</button></div>
        </header>

        {/* Top 4 Cards */}
        <div className="px-6 py-[14px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[14px]">
          <div className="bg-white rounded-xl border border-[#F1CBB5] p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span>👤</span>
                  <span className="text-sm font-semibold text-slate-800">Stage Wise Breakup</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><span className="font-medium text-slate-800">Total Grey Work</span><div className="text-slate-500">Budget = {formatLacs(grey.total)}</div></div>
                  <div><span className="font-medium text-slate-800">Total Finishing</span><div className="text-slate-500">Budget = {formatLacs(finishing.total)}</div></div>
                </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="w-[72px] h-[72px] rounded-full bg-[#F7ECDF] border border-[#F1CBB5] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M3 21V9.5L12 3L21 9.5V21H15V14H9V21H3Z" fill="#356D65"/><rect x="10.5" y="16" width="3" height="5" fill="#F7ECDF"/><rect x="5.5" y="11" width="2.5" height="2.5" fill="#F7ECDF"/><rect x="16" y="11" width="2.5" height="2.5" fill="#F7ECDF"/></svg>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">Project</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#F1CBB5] p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2"><span>🏗️</span><span className="text-sm font-semibold text-slate-800">Grey Work Budget Summary</span></div>
                <div className="text-xs text-slate-600 space-y-0.5 mb-3">
                  <div>Budget Planned = <span className="font-medium text-slate-800">{formatLacs(grey.total)}</span></div>
                  <div>Actual Spending = <span className="font-medium text-slate-800">{formatLacs(grey.spent)}</span></div>
                </div>
                <button onClick={() => setView('grey-details')} className="text-xs bg-[#356D65] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[72px] h-[72px]">
                  <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1CBB5" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#356D65" strokeWidth="3" strokeDasharray={`${Math.min(100, grey.used_pct)}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#356D65]">{Math.round(grey.used_pct)}%</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">Total Spending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#F1CBB5] p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2"><span>🎨</span><span className="text-sm font-semibold text-slate-800">Finishing Work Budget Summary</span></div>
                <div className="text-xs text-slate-600 space-y-0.5 mb-3">
                  <div>Budget Planned = <span className="font-medium text-slate-800">{formatLacs(finishing.total)}</span></div>
                  <div>Actual Spending = <span className="font-medium text-slate-800">{formatLacs(finishing.spent)}</span></div>
                </div>
                <button onClick={() => setView('finishing-details')} className="text-xs bg-[#356D65] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[72px] h-[72px]">
                  <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1CBB5" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e67e22" strokeWidth="3" strokeDasharray={`${Math.min(100, finishing.used_pct)}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-600">{Math.round(finishing.used_pct)}%</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">Total Spending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#F1CBB5] p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3"><span>💚</span><span className="text-sm font-semibold text-slate-800">BUDGET HEALTH</span></div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Over-budget activities</span><span className={`font-medium ${ov.budget.over_budget_count ? 'text-red-500' : 'text-[#356D65]'}`}>{ov.budget.over_budget_count}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Schedule Variance</span><span className={`font-medium ${variance > 0 ? 'text-red-500' : 'text-[#356D65]'}`}>{variance > 0 ? `+${variance} days behind` : variance < 0 ? `${-variance} days ahead` : 'On baseline'}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Forecast Completion</span><span className="font-medium text-slate-800">{ov.progress.project_finish}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Critical Activities</span><span className="font-medium text-slate-800">{ov.progress.critical_count}</span></div>
                </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="w-[72px] h-[72px] rounded-full bg-[#F7ECDF] border border-[#F1CBB5] flex items-center justify-center"><span className="text-3xl">💚</span></div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">Health</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="px-6 pb-6 flex-1 flex flex-col gap-[14px] min-h-0">
          {view === 'dashboard' ? (
            <div className="bg-[#F7ECDF] rounded-2xl border border-[#F1CBB5] p-8 flex-1 flex flex-col items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
                <div className="flex items-center gap-2 bg-white text-[#356D65] px-4 py-2 rounded-full text-sm font-medium border border-[#F1CBB5] shadow-sm"><span>✨</span> NV Homes AI</div>
                <div className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-full text-sm border border-[#F1CBB5]">Powered Search</div>
                <div className="flex items-center gap-2 bg-[#356D65] text-white px-4 py-2 rounded-full text-sm">Project Context On</div>
              </div>

              <div className="w-full max-w-[680px] mb-6">
                <div className="flex items-center bg-white border border-[#F1CBB5] rounded-full px-5 py-3.5 shadow-sm">
                  <span className="text-slate-400 mr-3 text-lg">🔍</span>
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Ask anything about this project... e.g. GF slab QC status, remaining budget" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"/>
                  <button onClick={ask} disabled={asking} className="bg-[#356D65] hover:bg-[#2a574f] text-white text-sm font-medium px-5 py-2 rounded-full flex items-center gap-1.5 transition shrink-0 ml-3 disabled:opacity-60"><span>✨</span> {asking ? 'Thinking…' : 'Ask AI'}</button>
                </div>
              </div>

              {answer && <pre className="w-full max-w-[680px] mb-6 whitespace-pre-wrap text-xs bg-white border border-[#F1CBB5] rounded-xl p-4 text-slate-700">{answer}</pre>}
              <div className="flex flex-wrap justify-center gap-2.5 mb-6">
                <QuickChip icon="📊" text="Budget vs Actual Summary" />
                <QuickChip icon="📅" text="What's Next this Week" />
                <QuickChip icon="📎" text="Upload Expense Bill" />
                <QuickChip icon="🧱" text="Explain Brickwork SOP" />
              </div>

              <div className="grid grid-cols-4 gap-4 w-full max-w-[700px] mb-5">
                <FeatureCard to="/budget" icon="📋" title="Activity Tracker" subtitle="Budget · QC · Timeline" />
                <FeatureCard icon="📖" title="Project SOP's" subtitle="Step-by-step guides" />
                <FeatureCard to="/budget" icon="🧾" title="Bills & Expenses" subtitle="Expenses per activity" />
                <FeatureCard to="/checklists" icon="✅" title="QC Reports" subtitle="Pass · Hold · Pending" />
              </div>

              <div className="text-center text-xs text-slate-500">
                Try: "Show remaining grey work budget" · "SOP for slab concreting in Urdu" · "List pending QC items"
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#F1CBB5] flex-1 flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F1CBB5] flex items-center justify-between bg-[#F7ECDF]/50">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-sm font-medium text-[#356D65] hover:bg-white px-3 py-1.5 rounded-lg transition border border-[#F1CBB5]">← Back to Dashboard</button>
                  <div className="h-5 w-px bg-[#F1CBB5]"></div>
                  <div className="flex items-center gap-2"><span className="text-lg">{currentIcon}</span><span className="font-semibold text-slate-800">{currentTitle}</span></div>
                </div>
                <div className="text-xs text-slate-500">{currentActivities.length} Activities</div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#F7ECDF] border-b border-[#F1CBB5]">
                    <tr className="text-left text-xs text-slate-600">
                      <th className="px-5 py-3 font-semibold">ACTIVITY</th>
                      <th className="px-4 py-3 font-semibold text-right">PLANNED</th>
                      <th className="px-4 py-3 font-semibold text-right">ACTUAL</th>
                      <th className="px-4 py-3 font-semibold text-center">QC STATUS</th>
                      <th className="px-5 py-3 font-semibold">TIMELINE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let lastCategory = null
                      return currentActivities.map((item) => {
                        const showCategory = item.category && item.category !== lastCategory
                        if (item.category) lastCategory = item.category
                        return (
                          <Fragment key={item.id}>
                            {showCategory && (
                              <tr className="bg-[#F7ECDF]"><td colSpan={5} className="px-5 py-2.5"><span className="font-bold text-sm text-[#356D65]">{item.category}</span></td></tr>
                            )}
                            <tr className="border-b border-[#F7ECDF] hover:bg-[#F7ECDF]/30 transition">
                              <td className={`px-5 py-2.5 ${item.category ? 'pl-8' : ''}`}><div className="font-medium text-slate-800 text-[13px]">{item.name}</div></td>
                              <td className="px-4 py-2.5 text-right text-slate-700 text-[13px]">{formatCurrency(item.planned)}</td>
                              <td className="px-4 py-2.5 text-right text-slate-700 text-[13px]">{formatCurrency(item.actual)}</td>
                              <td className="px-4 py-2.5 text-center"><span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${getQcBadge(item.qc)}`}>{item.qc}</span></td>
                              <td className="px-5 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[110px]">
                                    <div className={`h-full rounded-full ${item.qc === 'QC HOLD' ? 'bg-amber-500' : item.progress === 100 ? 'bg-emerald-500' : 'bg-[#356D65]'}`} style={{ width: `${item.progress}%` }}></div>
                                  </div>
                                  <span className="text-xs text-slate-500 w-8">{item.progress}%</span>
                                </div>
                              </td>
                            </tr>
                          </Fragment>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-[#F1CBB5] bg-white">
                <button onClick={() => setExpenseOpen(true)} className="w-full bg-[#356D65] hover:bg-[#2a574f] text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition"><span>➕</span> Add New Expense</button>
              </div>
            </div>
          )}

          {/* Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-[#F1CBB5] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-[#356D65] text-xs">✅</span><span className="text-xs font-semibold text-slate-800">Quality Assurance Checklists</span></div>
                <Link to="/checklists" className="text-[10px] text-[#356D65] underline">{qcQ.data.by_status.completed}/{qcQ.data.activity_count} done · open</Link>
              </div>
              <table className="w-full text-[10px]">
                <thead><tr className="text-slate-500 border-b border-[#F1CBB5]"><th className="text-left py-1 font-medium">NAME</th><th className="text-right py-1 font-medium">ITEMS</th><th className="text-right py-1 font-medium">YES</th><th className="text-right py-1 font-medium">PROGRESS</th></tr></thead>
                <tbody className="text-slate-700">
                  {qcRows.length === 0 && <tr><td colSpan={4} className="py-1 text-slate-400">No checklists started yet</td></tr>}
                  {qcRows.map((r) => (
                    <tr key={r.activity_no} className="border-b border-[#F7ECDF]"><td className="py-1">{r.activity_no}. {r.title}</td><td className="text-right">{r.total}</td><td className="text-right">{r.yes}</td><td className="text-right font-medium">{Math.round(r.progress * 100)}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border border-[#F1CBB5] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-[#356D65] text-xs">📄</span><span className="text-xs font-semibold text-slate-800">Recent Expenses</span></div>
                <span className="text-[10px] text-slate-400">Latest {ov.recent_expenses.length}</span>
              </div>
              <table className="w-full text-[10px] mb-2">
                <thead><tr className="text-slate-500 border-b border-[#F1CBB5]"><th className="text-left py-1 font-medium">DATE</th><th className="text-left py-1 font-medium pl-2">EXPENSE</th><th className="text-left py-1 font-medium">ACTIVITY</th><th className="text-right py-1 font-medium">TOTAL</th></tr></thead>
                <tbody className="text-slate-700">
                  {ov.recent_expenses.length === 0 && <tr><td colSpan={4} className="py-1 text-slate-400">No expenses yet</td></tr>}
                  {ov.recent_expenses.map((e) => (
                    <tr key={e.id}><td className="py-1">{e.expense_date}</td><td className="pl-2">{e.description}</td><td>{e.activity_no}. {e.activity_title}</td><td className="text-right font-medium">{formatRs(e.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setExpenseOpen(true)} className="w-full bg-[#356D65] hover:bg-[#2a574f] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"><span>➕</span> Add New Expense</button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="bg-white border border-[#F1CBB5] rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#F7ECDF] rounded-lg flex items-center justify-center text-base">📋</div><div className="text-xs font-semibold text-slate-800">Check Project SOP's</div></div>
                <button className="text-[10px] bg-[#356D65] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="bg-white border border-[#F1CBB5] rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#F7ECDF] rounded-lg flex items-center justify-center text-base">🏗️</div><div className="text-xs font-semibold text-slate-800">Check Real Time Progress</div></div>
                <Link to="/timeline" className="text-[10px] bg-[#356D65] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#2a574f] transition">Details</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {expenseOpen && (
        <ExpenseForm
          projectId={pid}
          activities={allActivities}
          defaultActivity={view === 'dashboard' ? undefined : (currentPart === 'grey' ? greyWorkActivities : finishingActivities)[0]?.activity_no}
          onClose={() => setExpenseOpen(false)}
          onSaved={() => { setExpenseOpen(false); reloadAll() }}
        />
      )}
    </div>
  )
}

function FeatureCard({ icon, title, subtitle, to }) {
  const Tag = to ? Link : 'div'
  return (
    <Tag to={to} className="block bg-white border border-[#F1CBB5] hover:border-[#356D65] hover:shadow-md rounded-xl cursor-pointer transition group p-4">
      <div className="bg-[#F7ECDF] group-hover:bg-[#F1CBB5] rounded-lg flex items-center justify-center transition w-10 h-10 text-xl mb-3">{icon}</div>
      <div className="font-semibold text-slate-800 text-sm">{title}</div>
      <div className="text-slate-500 mt-0.5 text-xs">{subtitle}</div>
    </Tag>
  )
}

function QuickChip({ icon, text }) {
  return (
    <button className="flex items-center gap-1.5 bg-white border border-[#F1CBB5] hover:border-[#356D65] hover:bg-[#F7ECDF] text-slate-600 hover:text-[#356D65] text-xs px-3.5 py-2 rounded-full transition shadow-sm">
      <span>{icon}</span><span>{text}</span>
    </button>
  )
}

export default ProjectBudgetTracking