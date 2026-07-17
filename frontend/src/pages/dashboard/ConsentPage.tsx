import { useState } from 'react'
import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'
import SegmentedTabs from '@/components/SegmentedTabs'

/* ── Types ──────────────────────────────────────────────────────────── */
type ConsentStatus = 'pending' | 'approved' | 'revoked'

interface Consent {
  platform: string
  logo: string
  scope: string
  requested: string
  expires: string | null
  status: ConsentStatus
}

/* ── Mock data ──────────────────────────────────────────────────────── */
const CONSENTS: Consent[] = [
  {
    platform: 'Wema Bank',
    logo: '/wema.jpg',
    scope: 'Bank statement · 90 days',
    requested: '3 min ago',
    expires: null,
    status: 'pending',
  },
  {
    platform: 'GTBank',
    logo: '/GTCO.jpg',
    scope: 'Bank statement · 180 days',
    requested: '2 hr ago',
    expires: null,
    status: 'pending',
  },
  {
    platform: 'Opay',
    logo: '/opay.png',
    scope: 'Income verification',
    requested: '18 min ago',
    expires: '12 Jan 2027',
    status: 'approved',
  },
  {
    platform: 'Kuda Bank',
    logo: '/kuda.jpg',
    scope: 'Identity credential only',
    requested: '1 hr ago',
    expires: '29 Jul 2026',
    status: 'approved',
  },
  {
    platform: 'Renmoney',
    logo: '/renmoney.jpg',
    scope: 'Full KYC + transactions',
    requested: '41 min ago',
    expires: null,
    status: 'revoked',
  },
]

/* ── Status badge ───────────────────────────────────────────────────── */
const STATUS_META: Record<ConsentStatus, { label: string; bg: string; color: string; border?: string }> = {
  pending:  { label: 'Pending',  bg: 'transparent', color: '#71717a', border: '1px solid #d4d4d8' },
  approved: { label: 'Approved', bg: '#f5d0fe',      color: '#a21caf' },
  revoked:  { label: 'Revoked',  bg: '#fee2e2',      color: '#dc2626' },
}

function StatusBadge({ status }: { status: ConsentStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color, border: m.border }}
    >
      {m.label}
    </span>
  )
}

/* ── Action buttons ─────────────────────────────────────────────────── */
function ActionButtons({ status }: { status: ConsentStatus }) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-1.5 rounded-full text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#c026d3' }}
        >
          Approve
        </button>
        <button className="px-4 py-1.5 rounded-full border border-neutral-200 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
          Deny
        </button>
      </div>
    )
  }
  if (status === 'approved') {
    return (
      <button className="px-4 py-1.5 rounded-full border border-neutral-200 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap">
        Revoke access
      </button>
    )
  }
  return (
    <button className="px-4 py-1.5 rounded-full border border-neutral-200 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
      View
    </button>
  )
}

/* ── Filter tabs ────────────────────────────────────────────────────── */
type Filter = 'all' | 'pending' | 'approved' | 'revoked'

const TABS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'pending',  label: 'Pending'  },
  { key: 'approved', label: 'Approved' },
  { key: 'revoked',  label: 'Revoked'  },
]

/* ── Page ───────────────────────────────────────────────────────────── */
export default function ConsentPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const visible = CONSENTS.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.platform.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Consent Requests</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">Manage which apps and platforms can access your FOID identity data</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full font-semibold text-[14px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors shrink-0">
          <RemixIcon name="ri-newspaper-line" size={20} /> Consent Policy
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pending Requests"  value="2"  sub="Awaiting your approval"       subColor="text-neutral-400"             icon="ri-alert-fill"           />
        <StatCard label="Approved"          value="14" sub="Banks, loans & merchants"      subColor="text-neutral-400"             icon="ri-checkbox-circle-fill" />
        <StatCard label="Denied"            value="3"  sub="Access blocked"                subColor="text-neutral-400"             icon="ri-close-circle-fill"    />
        <StatCard label="Active Agreements" value="11" sub="Covers ~52 more days"          subColor="text-neutral-400"             icon="ri-book-2-fill"          />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-4 py-4">
          <SegmentedTabs value={filter} onChange={setFilter} tabs={TABS} />

          {/* Search */}
          <div className="ml-auto relative w-[320px]">
            <RemixIcon
              name="ri-search-line"
              size={16}
              color="#a1a1aa"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by platform"
              className="pl-8 pr-4 py-2 w-full rounded-full border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-200">
              {['SHARED WITH', 'SCOPE', 'REQUESTED', 'EXPIRES', 'STATUS', 'ACTIONS'].map((col, i, arr) => (
                <th
                  key={col}
                  className={[
                    'px-6 py-4 text-[13px] font-semibold text-neutral-600 uppercase tracking-widest whitespace-nowrap',
                    i === 0              ? 'rounded-tl-xl' : '',
                    i === arr.length - 1 ? 'rounded-tr-xl' : '',
                  ].join(' ')}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((consent, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors">
                {/* Shared with */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={consent.logo}
                      alt={consent.platform}
                      className="w-9 h-9 rounded-lg object-contain shrink-0 border border-neutral-100 bg-white p-0.5"
                    />
                    <span className="text-[14px] font-semibold text-neutral-900 whitespace-nowrap">{consent.platform}</span>
                  </div>
                </td>

                {/* Scope */}
                <td className="px-6 py-5 text-[13px] text-neutral-600 max-w-[180px] leading-snug">{consent.scope}</td>

                {/* Requested */}
                <td className="px-6 py-5 text-[13px] text-neutral-500 whitespace-nowrap">{consent.requested}</td>

                {/* Expires */}
                <td className="px-6 py-5 text-[13px] text-neutral-500 whitespace-nowrap">{consent.expires ?? '—'}</td>

                {/* Status */}
                <td className="px-6 py-5"><StatusBadge status={consent.status} /></td>

                {/* Actions */}
                <td className="px-6 py-5"><ActionButtons status={consent.status} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-neutral-400">
                  No consents match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
