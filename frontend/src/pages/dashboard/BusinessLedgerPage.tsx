import { useState } from 'react'
import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'

/* ── Types ──────────────────────────────────────────────────────────── */
interface LedgerEntry {
  id: string
  date: string
  description: string
  category: string
  type: 'Income' | 'Expense'
  amount: string        // pre-formatted with sign, e.g. "+₦320,000"
  source: 'Receipt' | 'Invoice' | 'Bank'
  confidence: number    // 0-100
}

/* ── Mock ledger entries ─────────────────────────────────────────────── */
const ENTRIES: LedgerEntry[] = [
  { id: '1', date: '14 Jul 2026', description: 'Uber fleet — weekly delivery run',       category: 'Logistics', type: 'Expense', amount: '-₦48,200',  source: 'Receipt', confidence: 98  },
  { id: '2', date: '13 Jul 2026', description: 'Client payment — Studio Kola invoice #114', category: 'Sales',     type: 'Income',  amount: '+₦320,000', source: 'Invoice', confidence: 100 },
  { id: '3', date: '12 Jul 2026', description: 'Notion + Figma team subscription',        category: 'Software',  type: 'Expense', amount: '-₦31,500',  source: 'Receipt', confidence: 96  },
  { id: '4', date: '11 Jul 2026', description: 'Staff payroll — July first tranche',       category: 'Payroll',   type: 'Expense', amount: '-₦640,000', source: 'Bank',    confidence: 99  },
  { id: '5', date: '10 Jul 2026', description: 'Facebook + Google Ads — Q3 sprint',        category: 'Marketing', type: 'Expense', amount: '-₦140,700', source: 'Invoice', confidence: 94  },
  { id: '6', date: '09 Jul 2026', description: 'Client retainer — Vance Studios',          category: 'Sales',     type: 'Income',  amount: '+₦180,000', source: 'Invoice', confidence: 100 },
  { id: '7', date: '08 Jul 2026', description: 'Office supplies & stationery',              category: 'Other',     type: 'Expense', amount: '-₦74,000',  source: 'Receipt', confidence: 87  },
]

/* ── Spend categories for right-side panel ───────────────────────────── */
const SPEND_CATEGORIES = [
  { label: 'Payroll',    amount: '₦640,000', value: 640_000 },
  { label: 'Logistics',  amount: '₦318,200', value: 318_200 },
  { label: 'Software',   amount: '₦210,000', value: 210_000 },
  { label: 'Marketing',  amount: '₦140,700', value: 140_700 },
  { label: 'Other',      amount: '₦74,000',  value:  74_000 },
]
const SPEND_MAX = SPEND_CATEGORIES[0].value   // Payroll is the max

/* ── Donut chart ─────────────────────────────────────────────────────── */
const DONUT_SEGS = [
  { color: '#c026d3', pct: 46 },
  { color: '#e879f9', pct: 23 },
  { color: '#d4d4d8', pct: 15 },
  { color: '#a855f7', pct: 10 },
  { color: '#f0abfc', pct:  6 },
]
const GAP_DEG = 3

function SpendDonut() {
  const SIZE = 200, CX = 100, CY = 100, R = 74, SW = 18
  const circ = 2 * Math.PI * R
  let cursor = -90  // start from top

  const segments = DONUT_SEGS.map(s => {
    const spanDeg = (s.pct / 100) * 360 - GAP_DEG
    const entry = { ...s, startDeg: cursor + GAP_DEG / 2, spanDeg }
    cursor += (s.pct / 100) * 360
    return entry
  })

  const toArc = (deg: number) => {
    const frac = deg / 360
    return `${frac * circ} ${circ - frac * circ}`
  }

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f4f4f5" strokeWidth={SW} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={toArc(s.spanDeg)}
            transform={`rotate(${s.startDeg} ${CX} ${CY})`}
          />
        ))}
      </svg>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[22px] font-extrabold text-neutral-900 leading-none">₦1.38M</div>
        <div className="text-[11px] text-neutral-400 mt-1">total spend</div>
      </div>
      {/* Floating pct badges */}
      {segments.map((s, i) => {
        const midDeg = s.startDeg + s.spanDeg / 2
        const rad = (midDeg * Math.PI) / 180
        const bx = CX + R * Math.cos(rad)
        const by = CY + R * Math.sin(rad)
        return (
          <div
            key={i}
            className="absolute flex items-center justify-center rounded-full text-white font-bold"
            style={{
              width: 26, height: 26,
              background: s.color,
              fontSize: 10,
              left: bx,
              top: by,
              transform: 'translate(-50%,-50%)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }}
          >
            {s.pct}
          </div>
        )
      })}
    </div>
  )
}

/* ── Category progress bar row ───────────────────────────────────────── */
function CatRow({ label, amount, value }: { label: string; amount: string; value: number }) {
  const pct = Math.round((value / SPEND_MAX) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-semibold text-neutral-800 w-[80px] shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: '#c026d3' }}
        />
      </div>
      <span className="text-[13px] font-semibold text-neutral-800 w-[80px] text-right shrink-0">{amount}</span>
    </div>
  )
}

/* ── Source icon ─────────────────────────────────────────────────────── */
function SourceIcon({ source }: { source: LedgerEntry['source'] }) {
  const map: Record<LedgerEntry['source'], string> = {
    Receipt: 'ri-receipt-line',
    Invoice: 'ri-file-text-line',
    Bank:    'ri-bank-line',
  }
  return <RemixIcon name={map[source]} size={14} color="#a1a1aa" />
}

/* ── Category pill ───────────────────────────────────────────────────── */
const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  Logistics: { bg: '#eff6ff', color: '#2563eb' },
  Sales:     { bg: '#f0fdf4', color: '#16a34a' },
  Software:  { bg: '#faf5ff', color: '#7c3aed' },
  Payroll:   { bg: '#fae8ff', color: '#c026d3' },
  Marketing: { bg: '#fff7ed', color: '#c2410c' },
  Other:     { bg: '#f4f4f5', color: '#71717a' },
}
function CategoryPill({ label }: { label: string }) {
  const c = CAT_COLORS[label] ?? { bg: '#f4f4f5', color: '#71717a' }
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}
    >
      {label}
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 3

export default function BusinessLedger() {
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(ENTRIES.length / PAGE_SIZE)
  const pageEntries = ENTRIES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleRow = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    // demo: just acknowledge the drop
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-neutral-900">Business Ledger</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Snap a receipt, forward an invoice, or just ask — FOID's AI keeps your books for you
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[14px] text-white transition-opacity hover:opacity-90 shrink-0 self-start"
          style={{ background: '#c026d3' }}
        >
          <RemixIcon name="ri-camera-fill" size={18} color="#fff" />
          Scan receipt
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income (MTD)"   value="₦2,140,500" sub="↗ +8.4% vs last month"       subColor="text-brand-500 font-semibold" icon="ri-arrow-left-down-long-line"  />
        <StatCard label="Total Expenses (MTD)" value="₦1,382,900" sub="64.6% of income"               subColor="text-neutral-400"             icon="ri-arrow-right-up-long-line" />
        <StatCard label="Net Profit"           value="₦757,600"   sub="↗ Shared across 6 platforms"  subColor="text-brand-500 font-semibold" icon="ri-bar-chart-fill"            />
        <StatCard label="Estimated Tax"        value="₦412,600"   sub="Set aside for this quarter"    subColor="text-neutral-400"             icon="ri-bank-fill"                />
      </div>

      {/* ── Middle row: upload card + recent usage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Add a record — upload zone */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-neutral-900">Add a record</div>
              <div className="text-[12.5px] text-neutral-400 mt-0.5">Upload a receipt, invoice, or bank statement — AI does the rest</div>
            </div>
            <span
              className="text-[11.5px] font-semibold px-3 py-1 rounded-full shrink-0"
              style={{ background: '#fae8ff', color: '#c026d3' }}
            >
              ~4 credits / scan
            </span>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl py-12 transition-colors"
            style={{
              border: `2px dashed ${dragging ? '#c026d3' : '#e879f9'}`,
              background: dragging ? '#fdf4ff' : '#fdf4ff',
              minHeight: 260,
            }}
          >
            {/* Cloud-upload icon */}
            <RemixIcon name="ri-upload-cloud-2-line" size={84} color="#c026d3" />

            <div className="text-center">
              <p className="text-[14px] text-neutral-700">
                <span className="font-bold text-neutral-900">Drop a file here</span> or click to browse
              </p>
              <p className="text-[12px] text-neutral-400 mt-1">JPG, PNG, PDF up to 10MB — receipts, invoices, statements</p>
            </div>

            <button
              className="mt-1 px-6 py-2.5 rounded-full text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: '#c026d3' }}
            >
              Upload Image
            </button>
          </div>
        </div>

        {/* Recent usage — donut + bars */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-5">
          <div className="text-[15px] font-bold text-neutral-900">Recent usage</div>

          {/* Donut */}
          <SpendDonut />

          {/* Category bars */}
          <div className="flex flex-col gap-3 mt-1">
            {SPEND_CATEGORIES.map(c => (
              <CatRow key={c.label} label={c.label} amount={c.amount} value={c.value} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Latest AI-categorised entries table ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">

        {/* Table toolbar */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 gap-4">
          <div>
            <div className="text-[15px] font-bold text-neutral-900">Latest AI-categorised entries</div>
            <div className="text-[12px] text-neutral-400 mt-0.5">Auto-extracted from uploaded documents</div>
          </div>
          <button className="px-4 py-2 rounded-full border border-neutral-200 text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0">
            View full ledger
          </button>
        </div>

        {/* Table — scrollable on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 780 }}>
            <thead>
              <tr className="border-y border-neutral-100 bg-neutral-50">
                {/* Checkbox col */}
                <th className="pl-6 pr-3 py-3 w-10">
                  <input type="checkbox" className="accent-[#c026d3] w-4 h-4 rounded" readOnly />
                </th>
                {['DATE', 'DESCRIPTION', 'CATEGORY', 'TYPE', 'AMOUNT', 'SOURCE', 'CONFIDENCE', 'ACTIONS'].map(col => (
                  <th
                    key={col}
                    className="px-3 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap last:pr-6"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageEntries.map(entry => (
                <tr
                  key={entry.id}
                  className={`hover:bg-neutral-50/60 transition-colors ${selected.has(entry.id) ? 'bg-brand-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="pl-6 pr-3 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(entry.id)}
                      onChange={() => toggleRow(entry.id)}
                      className="accent-[#c026d3] w-4 h-4 rounded"
                    />
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-[13px] text-neutral-500 whitespace-nowrap">{entry.date}</td>

                  {/* Description */}
                  <td className="px-3 py-4 text-[13px] font-medium text-neutral-800 max-w-[200px]">{entry.description}</td>

                  {/* Category */}
                  <td className="px-3 py-4"><CategoryPill label={entry.category} /></td>

                  {/* Type */}
                  <td className="px-3 py-4 text-[13px] text-neutral-600">{entry.type}</td>

                  {/* Amount */}
                  <td
                    className="px-3 py-4 text-[13px] font-semibold whitespace-nowrap"
                    style={{ color: entry.type === 'Income' ? '#16a34a' : '#dc2626' }}
                  >
                    {entry.amount}
                  </td>

                  {/* Source */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-[12.5px] text-neutral-500">
                      <SourceIcon source={entry.source} />
                      {entry.source}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-4 text-[13px] text-neutral-600 whitespace-nowrap">{entry.confidence}%</td>

                  {/* Actions */}
                  <td className="px-3 py-4 pr-6">
                    <button className="flex items-center gap-1 text-[12.5px] font-semibold text-neutral-600 hover:text-brand-500 transition-colors">
                      <RemixIcon name="ri-pencil-line" size={13} color="currentColor" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100">
          <span className="text-[13px] text-neutral-500">
            Showing <span className="font-semibold text-neutral-800">{PAGE_SIZE}</span> of{' '}
            <span className="font-semibold text-neutral-800">2,614</span> ledger entries
          </span>
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <RemixIcon name="ri-arrow-left-s-line" size={16} color="currentColor" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors"
                style={
                  page === p
                    ? { background: '#c026d3', color: '#fff' }
                    : { background: 'transparent', color: '#71717a' }
                }
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <RemixIcon name="ri-arrow-right-s-line" size={16} color="currentColor" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
