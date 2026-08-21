import { useState, Fragment } from 'react'

function ProjectBudgetTracking() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState('dashboard')

  const greyWorkActivities = [
    { id: 1, name: 'Excavation', planned: 180000, actual: 170500, qc: 'PASS', progress: 100 },
    { id: 2, name: 'Foundation & Plinth', planned: 620000, actual: 615200, qc: 'PASS', progress: 100 },
    { id: 3, name: 'Brickwork — GF', planned: 540000, actual: 498000, qc: 'PASS', progress: 95 },
    { id: 4, name: 'GF Slab Shuttering & Steel', planned: 410000, actual: 405600, qc: 'QC HOLD', progress: 90 },
    { id: 5, name: 'GF Slab Electric Conduiting', planned: 95000, actual: 91200, qc: 'PASS', progress: 100 },
    { id: 6, name: 'GF Slab Concreting', planned: 360000, actual: 372000, qc: 'PASS', progress: 100 },
    { id: 7, name: 'FF Brickwork', planned: 560000, actual: 492000, qc: 'PENDING', progress: 70 },
    { id: 8, name: 'FF Slab Shuttering & Steel', planned: 420000, actual: 210000, qc: 'PENDING', progress: 40 },
    { id: 9, name: 'FF Slab Conduiting', planned: 98000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 10, name: 'FF Slab Concreting', planned: 390000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 11, name: 'Roof Top Parapet', planned: 145000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 12, name: 'Roof Top Mumty Structure', planned: 165000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 13, name: 'GF Internal Plastering', planned: 210000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 14, name: 'Exterior Boundary Wall', planned: 175000, actual: 168400, qc: 'PASS', progress: 100 },
    { id: 15, name: 'UGWT & OHWT', planned: 220000, actual: 205000, qc: 'PASS', progress: 100 },
    { id: 16, name: 'Grey Work Labor', planned: 890000, actual: 742000, qc: 'PASS', progress: 85 },
    { id: 17, name: 'Misc. Expenses', planned: 60000, actual: 46800, qc: 'PASS', progress: 80 },
  ]

  const finishingActivities = [
    { id: 101, category: 'Tiles & Granites', name: 'Floor Tiles', planned: 850000, actual: 620000, qc: 'PENDING', progress: 45 },
    { id: 102, category: 'Tiles & Granites', name: 'Washroom Tiles', planned: 320000, actual: 185000, qc: 'PENDING', progress: 30 },
    { id: 103, category: 'Tiles & Granites', name: 'Stair Granite', planned: 180000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 104, category: 'Tiles & Granites', name: 'Podium Granite', planned: 275000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 105, category: 'Tiles & Granites', name: 'Window Sills', planned: 95000, actual: 42000, qc: 'PENDING', progress: 25 },
    { id: 106, category: 'Tiles & Granites', name: 'Kitchen Marble Top', planned: 165000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 201, category: 'Wood Work', name: 'Solid Doors', planned: 480000, actual: 210000, qc: 'PENDING', progress: 35 },
    { id: 202, category: 'Wood Work', name: 'Chokhat & Border', planned: 195000, actual: 95000, qc: 'PENDING', progress: 40 },
    { id: 203, category: 'Wood Work', name: 'Glass Doors', planned: 220000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 204, category: 'Wood Work', name: 'Main Door & Window', planned: 350000, actual: 180000, qc: 'PENDING', progress: 50 },
    { id: 205, category: 'Wood Work', name: 'Stair Top Handle', planned: 75000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 206, category: 'Wood Work', name: 'Stair Cladding', planned: 140000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 207, category: 'Wood Work', name: 'Kitchen', planned: 420000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 208, category: 'Wood Work', name: 'Hardware', planned: 85000, actual: 32000, qc: 'PENDING', progress: 20 },
    { id: 209, category: 'Wood Work', name: 'Opening Jam', planned: 60000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 301, category: 'False Ceiling', name: 'GF Ceiling', planned: 280000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 302, category: 'False Ceiling', name: 'FF Lobbies', planned: 195000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 401, category: 'Steel & Wrought Iron', name: 'Steel Stair', planned: 320000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 402, category: 'Steel & Wrought Iron', name: 'Steel Railing', planned: 185000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 501, category: 'Paint & Polish', name: 'Paint Work', planned: 450000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 502, category: 'Paint & Polish', name: 'Polish Work', planned: 175000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 601, category: 'Moulding Work', name: 'Moulding Work', planned: 210000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 701, category: 'Electric Work', name: 'Electric Cables', planned: 185000, actual: 92000, qc: 'PENDING', progress: 40 },
    { id: 702, category: 'Electric Work', name: 'Lights', planned: 320000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 703, category: 'Electric Work', name: 'Switch Plates', planned: 65000, actual: 28000, qc: 'PENDING', progress: 35 },
    { id: 704, category: 'Electric Work', name: 'Exhaust Fans & Flexible Pipe', planned: 45000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 705, category: 'Electric Work', name: 'Rope Lights', planned: 38000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 706, category: 'Electric Work', name: 'DB', planned: 95000, actual: 45000, qc: 'PENDING', progress: 50 },
    { id: 707, category: 'Electric Work', name: 'Main Cable', planned: 120000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 708, category: 'Electric Work', name: 'Ceiling Fans', planned: 85000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 709, category: 'Electric Work', name: 'Earthing', planned: 35000, actual: 18000, qc: 'PENDING', progress: 60 },
    { id: 710, category: 'Electric Work', name: 'Lawn & Boundary Wall Lights', planned: 75000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 711, category: 'Electric Work', name: 'Speakers with Amplifier', planned: 110000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 712, category: 'Electric Work', name: 'Wall Lights & Chandeliers', planned: 195000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 801, category: 'Sanitary Works', name: 'Commode', planned: 145000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 802, category: 'Sanitary Works', name: 'Fixtures', planned: 185000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 803, category: 'Sanitary Works', name: 'Vanity & Looking Mirror', planned: 165000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 804, category: 'Sanitary Works', name: 'Accessory Set', planned: 55000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 805, category: 'Sanitary Works', name: 'Kitchen Sink & Mixer', planned: 85000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 806, category: 'Sanitary Works', name: 'Geyser', planned: 95000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 807, category: 'Sanitary Works', name: 'Motor & Pressure Pump', planned: 120000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 808, category: 'Sanitary Works', name: 'Basement Kitchen', planned: 75000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 809, category: 'Sanitary Works', name: 'Indian Seat', planned: 25000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 901, category: 'Landscaping', name: 'Soft Landscape', planned: 280000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 902, category: 'Landscaping', name: 'Hard Landscape', planned: 195000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1001, category: 'Aluminium & Glass', name: 'Windows', planned: 520000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1002, category: 'Aluminium & Glass', name: 'Main Door Glass', planned: 185000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1003, category: 'Aluminium & Glass', name: 'Glass Work for Doors', planned: 95000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1101, category: 'Rockwall', name: 'Rockwall', planned: 165000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1201, category: 'Wallpapers', name: 'Wallpapers', planned: 95000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1301, category: 'Misc.', name: 'Misc.', planned: 120000, actual: 45000, qc: 'PENDING', progress: 20 },
    { id: 1401, category: 'Tough Tile', name: 'Tough Tile', planned: 85000, actual: 0, qc: 'PENDING', progress: 0 },
    { id: 1501, category: 'Labors', name: 'Tile Labor', planned: 280000, actual: 95000, qc: 'PENDING', progress: 25 },
    { id: 1502, category: 'Labors', name: 'Electric Labor', planned: 195000, actual: 72000, qc: 'PENDING', progress: 30 },
    { id: 1503, category: 'Labors', name: 'Sanitary Labor', planned: 165000, actual: 0, qc: 'PENDING', progress: 0 },
  ]

  const formatCurrency = (num) => {
    if (!num || num === 0) return '—'
    return `Rs ${num.toLocaleString('en-IN')}`
  }

  const getQcBadge = (status) => {
    if (status === 'PASS') return 'bg-emerald-100 text-emerald-700'
    if (status === 'QC HOLD') return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-600'
  }

  const currentActivities = view === 'grey-details' ? greyWorkActivities : finishingActivities
  const currentTitle = view === 'grey-details' ? 'Grey Work — Activity-Wise Budget & Progress' : 'Finishing Work — Activity-Wise Budget & Progress'
  const currentIcon = view === 'grey-details' ? '🏗️' : '🎨'

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
          <div className="text-[11px] font-bold text-slate-800">125.0</div>
          <div className="text-[9px] text-slate-500">Lacs</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-[#356D65] text-base">📈</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Total Spending</div>
          <div className="text-[11px] font-bold text-slate-800">48%</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-[#356D65] text-base">🏦</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Budget Remaining</div>
          <div className="text-[11px] font-bold text-slate-800">65.0</div>
          <div className="text-[9px] text-slate-500">Lacs</div>
        </div>
        <div className="w-20 bg-[#356D65] text-white rounded-xl p-2 text-center shadow-sm">
          <div className="text-base">📊</div>
          <div className="text-[9px] mt-0.5 opacity-90">Overall Progress</div>
          <div className="text-[11px] font-bold">On Track</div>
        </div>
        <div className="w-20 bg-white border border-[#F1CBB5] rounded-xl p-2 text-center shadow-sm">
          <div className="text-amber-500 text-base">⭐</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Quality Score</div>
          <div className="text-[11px] font-bold text-slate-800">97.0</div>
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
            <span className="text-slate-500 text-sm">Client : Mr Ahmed Khan</span>
          </div>
          <div className="bg-[#F7ECDF] text-[#356D65] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 border border-[#F1CBB5]">
            <span className="w-2 h-2 bg-[#356D65] rounded-full"></span>
            Project Monitoring & Control System
          </div>
          <div className="text-sm font-medium text-slate-700">10- Marla House DHA Phase-6</div>
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
                  <div><span className="font-medium text-slate-800">Total Grey Work</span><div className="text-slate-500">Budget = 65 Lacs</div></div>
                  <div><span className="font-medium text-slate-800">Total Finishing</span><div className="text-slate-500">Budget = 60 Lacs</div></div>
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
                  <div>Budget Planned = <span className="font-medium text-slate-800">65 Lacs</span></div>
                  <div>Actual Spending = <span className="font-medium text-slate-800">35 Lacs</span></div>
                </div>
                <button onClick={() => setView('grey-details')} className="text-xs bg-[#356D65] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[72px] h-[72px]">
                  <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1CBB5" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#356D65" strokeWidth="3" strokeDasharray="62, 100"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#356D65]">62%</div>
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
                  <div>Budget Planned = <span className="font-medium text-slate-800">60 Lacs</span></div>
                  <div>Actual Spending = <span className="font-medium text-slate-800">25 Lacs</span></div>
                </div>
                <button onClick={() => setView('finishing-details')} className="text-xs bg-[#356D65] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[72px] h-[72px]">
                  <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1CBB5" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e67e22" strokeWidth="3" strokeDasharray="40, 100"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-600">40%</div>
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
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Cost Variance</span><span className="font-medium text-[#356D65]">~Rs 2.1L (favourable)</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Schedule Variance</span><span className="font-medium text-red-500">+6 days behind</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Forecast at Completion</span><span className="font-medium text-slate-800">Rs 1.23 Cr</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Contingency Used</span><span className="font-medium text-slate-800">11%</span></div>
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
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything about this project... e.g. GF slab QC status, remaining budget" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"/>
                  <button className="bg-[#356D65] hover:bg-[#2a574f] text-white text-sm font-medium px-5 py-2 rounded-full flex items-center gap-1.5 transition shrink-0 ml-3"><span>✨</span> Ask AI</button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 mb-6">
                <QuickChip icon="📊" text="Budget vs Actual Summary" />
                <QuickChip icon="📅" text="What's Next this Week" />
                <QuickChip icon="📎" text="Upload Expense Bill" />
                <QuickChip icon="🧱" text="Explain Brickwork SOP" />
              </div>

              <div className="grid grid-cols-4 gap-4 w-full max-w-[700px] mb-5">
                <FeatureCard icon="📋" title="Activity Tracker" subtitle="Budget · QC · Timeline" />
                <FeatureCard icon="📖" title="Project SOP's" subtitle="Step-by-step guides" />
                <FeatureCard icon="🧾" title="Bills & Expenses" subtitle="AI OCR upload" />
                <FeatureCard icon="✅" title="QC Reports" subtitle="Pass · Hold · Pending" />
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
                <button className="w-full bg-[#356D65] hover:bg-[#2a574f] text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition"><span>➕</span> Add New Expense</button>
              </div>
            </div>
          )}

          {/* Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-[#F1CBB5] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-[#356D65] text-xs">✅</span><span className="text-xs font-semibold text-slate-800">Quality Assurance Checklists</span></div>
                <span className="text-[10px] text-slate-400">Peplones ▾</span>
              </div>
              <table className="w-full text-[10px]">
                <thead><tr className="text-slate-500 border-b border-[#F1CBB5]"><th className="text-left py-1 font-medium">NAME</th><th className="text-right py-1 font-medium">ITEMS</th><th className="text-right py-1 font-medium">POINTS</th><th className="text-right py-1 font-medium">SCORE</th></tr></thead>
                <tbody className="text-slate-700">
                  <tr className="border-b border-[#F7ECDF]"><td className="py-1">$4.31088</td><td className="text-right">67.59</td><td className="text-right">67.55</td><td className="text-right font-medium">234000</td></tr>
                  <tr><td className="py-1">$4.30498</td><td className="text-right">23.45</td><td className="text-right">32.09</td><td className="text-right font-medium">122598</td></tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border border-[#F1CBB5] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-[#356D65] text-xs">📄</span><span className="text-xs font-semibold text-slate-800">Recent Expenses</span></div>
                <span className="text-[10px] text-slate-400">Peplons ▾</span>
              </div>
              <table className="w-full text-[10px] mb-2">
                <thead><tr className="text-slate-500 border-b border-[#F1CBB5]"><th className="text-left py-1 font-medium">DATE</th><th className="text-right py-1 font-medium">EXPENSE</th><th className="text-right py-1 font-medium">RATE</th><th className="text-right py-1 font-medium">TOTAL</th></tr></thead>
                <tbody className="text-slate-700"><tr><td className="py-1">Saty 22</td><td className="text-right">13.0200</td><td className="text-right">23.25</td><td className="text-right font-medium">13,200</td></tr></tbody>
              </table>
              <button className="w-full bg-[#356D65] hover:bg-[#2a574f] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"><span>➕</span> Add New Expense</button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="bg-white border border-[#F1CBB5] rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#F7ECDF] rounded-lg flex items-center justify-center text-base">📋</div><div className="text-xs font-semibold text-slate-800">Check Project SOP's</div></div>
                <button className="text-[10px] bg-[#356D65] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
              <div className="bg-white border border-[#F1CBB5] rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#F7ECDF] rounded-lg flex items-center justify-center text-base">🏗️</div><div className="text-xs font-semibold text-slate-800">Check Real Time Progress</div></div>
                <button className="text-[10px] bg-[#356D65] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#2a574f] transition">Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="bg-white border border-[#F1CBB5] hover:border-[#356D65] hover:shadow-md rounded-xl cursor-pointer transition group p-4">
      <div className="bg-[#F7ECDF] group-hover:bg-[#F1CBB5] rounded-lg flex items-center justify-center transition w-10 h-10 text-xl mb-3">{icon}</div>
      <div className="font-semibold text-slate-800 text-sm">{title}</div>
      <div className="text-slate-500 mt-0.5 text-xs">{subtitle}</div>
    </div>
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