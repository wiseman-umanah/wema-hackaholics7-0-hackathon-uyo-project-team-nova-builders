import { useState } from 'react'
import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'

/* ── Types ──────────────────────────────────────────────────────────── */
type EntryType   = 'Income' | 'Expense'
type EntrySource = 'Receipt' | 'Invoice' | 'Bank'

interface LedgerEntry {
  id: string
  date: string
  description: string
  category: string
  type: EntryType
  amount: string
  source: EntrySource
  confidence: number
}

/* ── Mock data — exactly matching screenshot ────────────────────────── */
const ALL_ENTRIES: LedgerEntry[] = [
  { id: '1',  date: '14 Jul 2026', description: 'Uber fleet — weekly delivery run',         category: 'Logistics', type: 'Expense', amount: '-₦48,200',  source: 'Receipt', confidence: 98  },
  { id: '2',  date: '13 Jul 2026', description: 'Client payment — Studio Kola invoice #114', category: 'Sales',     type: 'Income',  amount: '+₦320,000', source: 'Invoice', confidence: 100 },
  { id: '3',  date: '12 Jul 2026', description: 'Notion + Figma team subscription',          category: 'Software',  type: 'Expense', amount: '-₦31,500',  source: 'Receipt', confidence: 96  },
  { id: '4',  date: '11 Jul 2026', description: 'Instagram ad campaign — July push',          category: 'Marketing', type: 'Expense', amount: '-₦60,000',  source: 'Invoice', confidence: 93  },
  { id: '5',  date: '10 Jul 2026', description: 'Payroll — 6 staff, first half July',         category: 'Payroll',   type: 'Expense', amount: '-₦320,000', source: 'Receipt', confidence: 100 },
  { id: '6',  date: '08 Jul 2026', description: 'Diesel generator refuel — office',           category: 'Utilities', type: 'Expense', amount: '-₦22,400',  source: 'Invoice', confidence: 91  },
  { id: '7',  date: '06 Jul 2026', description: 'Client payment — Lagos Fabrics Ltd',         category: 'Sales',     type: 'Income',  amount: '+₦540,000', source: 'Receipt', confidence: 100 },
  /* Page 2 */
  { id: '8',  date: '05 Jul 2026', description: 'Shopify subscription — monthly',             category: 'Software',  type: 'Expense', amount: '-₦18,200',  source: 'Receipt', confidence: 99  },
  { id: '9',  date: '04 Jul 2026', description: 'Client retainer — Vance Studios',            category: 'Sales',     type: 'Income',  amount: '+₦180,000', source: 'Invoice', confidence: 100 },
  { id: '10', date: '03 Jul 2026', description: 'Office supplies & stationery',               category: 'Other',     type: 'Expense', amount: '-₦74,000',  source: 'Receipt', confidence: 87  },
  { id: '11', date: '02 Jul 2026', description: 'Electricity bill — PHCN July',               category: 'Utilities', type: 'Expense', amount: '-₦41,500',  source: 'Invoice', confidence: 94  },
  { id: '12', date: '01 Jul 2026', description: 'Client payment — Apex Holdings',             category: 'Sales',     type: 'Income',  amount: '+₦210,000', source: 'Invoice', confidence: 100 },
  { id: '13', date: '30 Jun 2026', description: 'Facebook Ads — June retargeting',            category: 'Marketing', type: 'Expense', amount: '-₦80,700',  source: 'Invoice', confidence: 95  },
  { id: '14', date: '29 Jun 2026', description: 'Uber fleet — weekly delivery run',           category: 'Logistics', type: 'Expense', amount: '-₦48,200',  source: 'Receipt', confidence: 98  },
  /* Page 3 */
  { id: '15', date: '28 Jun 2026', description: 'Staff payroll — June second tranche',        category: 'Payroll',   type: 'Expense', amount: '-₦640,000', source: 'Bank',    confidence: 99  },
  { id: '16', date: '27 Jun 2026', description: 'Client payment — Taye Digital',              category: 'Sales',     type: 'Income',  amount: '+₦150,000', source: 'Invoice', confidence: 100 },
  { id: '17', date: '26 Jun 2026', description: 'Google Workspace subscription',              category: 'Software',  type: 'Expense', amount: '-₦12,500',  source: 'Receipt', confidence: 97  },
  { id: '18', date: '25 Jun 2026', description: 'Cold storage diesel — Apapa',                category: 'Logistics', type: 'Expense', amount: '-₦55,000',  source: 'Receipt', confidence: 92  },
  { id: '19', date: '24 Jun 2026', description: 'Client payment — Nova Properties',           category: 'Sales',     type: 'Income',  amount: '+₦480,000', source: 'Bank',    confidence: 100 },
  { id: '20', date: '23 Jun 2026', description: 'Office printer cartridges',                  category: 'Other',     type: 'Expense', amount: '-₦28,000',  source: 'Receipt', confidence: 88  },
  { id: '21', date: '22 Jun 2026', description: 'Instagram ad campaign — June push',          category: 'Marketing', type: 'Expense', amount: '-₦65,200',  source: 'Invoice', confidence: 93  },
]

/* ── Category pill — outlined style from screenshot ─────────────────── */
const CAT_COLORS: Record<string, { border: string; color: string }> = {
  Logistics: { border: '#bfdbfe', color: '#2563eb' },
  Sales:     { border: '#bbf7d0', color: '#16a34a' },
  Software:  { border: '#ddd6fe', color: '#7c3aed' },
  Payroll:   { border: '#f5d0fe', color: '#c026d3' },
  Marketing: { border: '#fed7aa', color: '#c2410c' },
  Utilities: { border: '#fde68a', color: '#92400e' },
  Other:     { border: '#d4d4d8', color: '#71717a' },
}
function CategoryPill({ label }: { label: string }) {
  const c = CAT_COLORS[label] ?? { border: '#d4d4d8', color: '#71717a' }
  return (
    <span
      className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ border: `1px solid ${c.border}`, color: c.color, background: 'transparent' }}
    >
      {label}
    </span>
  )
}

/* ── Source icon + label ─────────────────────────────────────────────── */
const SOURCE_ICON: Record<EntrySource, string> = {
  Receipt: 'ri-receipt-line',
  Invoice: 'ri-file-text-line',
  Bank:    'ri-bank-line',
}

/* ── Filter tabs ─────────────────────────────────────────────────────── */
type Filter = 'All' | 'Income' | 'Expense' | 'Edited by me'
const TABS: Filter[] = ['All', 'Income', 'Expense', 'Edited by me']

/* ════════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 7

export default function LedgerHistory() {
  const [filter, setFilter]   = useState<Filter>('All')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  /* Filter + search */
  const filtered = ALL_ENTRIES.filter(e => {
    if (filter === 'Income'  && e.type !== 'Income')  return false
    if (filter === 'Expense' && e.type !== 'Expense') return false
    if (filter === 'Edited by me') return false   // demo: none edited
    if (search) {
      const q = search.toLowerCase()
      return (
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)    ||
        e.amount.includes(q)
      )
    }
    return true
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const pageEntries = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleRow = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allChecked = pageEntries.length > 0 && pageEntries.every(e => selected.has(e.id))
  const toggleAll  = () => {
    if (allChecked) {
      setSelected(prev => {
        const next = new Set(prev)
        pageEntries.forEach(e => next.delete(e.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        pageEntries.forEach(e => next.add(e.id))
        return next
      })
    }
  }

  const handleFilterChange = (f: Filter) => { setFilter(f); setPage(1) }
  const handleSearch = (v: string)        => { setSearch(v); setPage(1) }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-neutral-900">Ledger History</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Every AI-generated ledger entry — searchable, editable, and exportable
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-full text-[13px] font-semibold text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-text-line" size={16} color="#18181b" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-full text-[13px] font-semibold text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-pdf-2-line" size={16} color="#18181b" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stat cards — exact values from screenshot ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entries"      value="2,614"     sub="Since your account began"  subColor="text-neutral-400" icon="ri-list-check-2"          />
        <StatCard label="Auto-categorised"   value="97.1%"     sub="Without manual edits"      subColor="text-neutral-400" icon="ri-arrow-right-up-line"    />
        <StatCard label="Exports This Month" value="9"         sub="CSV & PDF combined"         subColor="text-neutral-400" icon="ri-bar-chart-grouped-line" />
        <StatCard label="Estimated Tax"      value="Unlimited" sub="Full history kept, always" subColor="text-neutral-400" icon="ri-wallet-line"             />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">

        {/* ── Filter tabs + search row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-4">

          {/* Sliding-pill tabs */}
          <div
            className="flex items-center rounded-full p-1 shrink-0"
            style={{ background: '#f0f0f0' }}
          >
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className="px-4 sm:px-6 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap"
                style={
                  filter === tab
                    ? { background: '#fff', color: '#18181b', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { background: 'transparent', color: '#9a9a9a' }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[300px]">
            <RemixIcon
              name="ri-search-line"
              size={15}
              color="#a1a1aa"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search description, amounts, tag"
              className="w-full pl-9 pr-4 py-2 rounded-full border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
        </div>

        {/* ── Table — scrollable on mobile ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 820 }}>
            <thead>
              <tr className="border-y border-neutral-100" style={{ background: '#fafafa' }}>
                {/* Select-all checkbox */}
                <th className="pl-6 pr-3 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded-full accent-[#c026d3]"
                  />
                </th>
                {['DATE', 'DESCRIPTION', 'CATEGORY', 'TYPE', 'AMOUNT', 'SOURCE', 'CONFIDENCE', 'ACTIONS'].map(col => (
                  <th
                    key={col}
                    className="px-3 py-3.5 text-[11.5px] font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap last:pr-6"
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
                  className={`transition-colors hover:bg-neutral-50/60 ${selected.has(entry.id) ? 'bg-[#fdf4ff]' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="pl-6 pr-3 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(entry.id)}
                      onChange={() => toggleRow(entry.id)}
                      className="w-4 h-4 rounded-full accent-[#c026d3]"
                    />
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-[13px] font-semibold text-neutral-800 whitespace-nowrap">
                    {entry.date}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-4 text-[13px] text-neutral-700 max-w-[200px] leading-snug">
                    {entry.description}
                  </td>

                  {/* Category */}
                  <td className="px-3 py-4">
                    <CategoryPill label={entry.category} />
                  </td>

                  {/* Type */}
                  <td className="px-3 py-4 text-[13px] text-neutral-600">
                    {entry.type}
                  </td>

                  {/* Amount */}
                  <td
                    className="px-3 py-4 text-[13px] font-semibold whitespace-nowrap"
                    style={{ color: entry.type === 'Income' ? '#16a34a' : '#dc2626' }}
                  >
                    {entry.amount}
                  </td>

                  {/* Source */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-neutral-600">
                      <RemixIcon name={SOURCE_ICON[entry.source]} size={14} color="#a1a1aa" />
                      {entry.source}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-4 text-[13px] text-neutral-600 whitespace-nowrap">
                    {entry.confidence}%
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-4 pr-6">
                    <button className="flex items-center gap-1 text-[13px] font-semibold text-neutral-600 hover:text-brand-500 transition-colors">
                      <RemixIcon name="ri-pencil-line" size={13} color="currentColor" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {pageEntries.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[13px] text-neutral-400">
                    No entries match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100">
          <span className="text-[13px] text-neutral-600">
            Showing{' '}
            <span className="font-semibold text-neutral-900">{pageEntries.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-neutral-900">2,614</span>
            {' '}ledger entries
          </span>

          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <RemixIcon name="ri-arrow-left-s-line" size={16} color="currentColor" />
            </button>

            {/* Page numbers — show up to 5 around current */}
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors"
                style={
                  safePage === p
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
              disabled={safePage === totalPages}
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
