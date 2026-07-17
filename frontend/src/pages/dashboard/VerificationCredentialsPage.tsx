import { useState } from 'react'
import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'
import SegmentedTabs from '@/components/SegmentedTabs'


/* ── Types ──────────────────────────────────────────────────────────── */
type CredentialStatus = 'active' | 'expiring' | 'revoked'

interface Credential {
  id: string
  platform: string
  logo: string
  scope: string
  issued: string
  expires: string | null
  status: CredentialStatus
}

/* ── Mock data ──────────────────────────────────────────────────────── */
const CREDENTIALS: Credential[] = [
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'Wema Bank',
    logo: '/wema.jpg',
    scope: 'KYC · Full',
    issued: '12 Jul 2026',
    expires: '12 Jun 2027',
    status: 'active',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'GTBank',
    logo: '/GTCO.jpg',
    scope: 'Loan · Income verification',
    issued: '03 Jul 2026',
    expires: '03 Jul 2027',
    status: 'active',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'Opay',
    logo: '/opay.png',
    scope: 'Merchant KYC',
    issued: '29 Aug 2025',
    expires: '29 Jul 2026',
    status: 'expiring',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'Renmoney',
    logo: '/renmoney.jpg',
    scope: 'Full KYC + transactions',
    issued: '02 Feb 2026',
    expires: null,
    status: 'revoked',
  },
]


/* ── Status badge ───────────────────────────────────────────────────── */
const STATUS_META: Record<CredentialStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'Active',   bg: '#dcfce7', color: '#15803d' },
  expiring: { label: 'Expiring', bg: '#fff7ed', color: '#c2410c' },
  revoked:  { label: 'Revoked',  bg: '#fee2e2', color: '#dc2626' },
}

function StatusBadge({ status }: { status: CredentialStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  )
}

/* ── Action button ──────────────────────────────────────────────────── */
function ActionButton({ status }: { status: CredentialStatus }) {
  const label   = status === 'expiring' ? 'Renew' : 'Revoke'
  const disabled = status === 'revoked'
  return (
    <button
      disabled={disabled}
      className="px-4 py-1.5 rounded-full border border-neutral-200 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  )
}

/* ── Filter tabs ────────────────────────────────────────────────────── */
type Filter = 'all' | 'active' | 'expiring' | 'revoked'

const TABS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'active',   label: 'Active'   },
  { key: 'expiring', label: 'Expiring' },
  { key: 'revoked',  label: 'Revoked'  },
]

/* ── Page ───────────────────────────────────────────────────────────── */
export default function VerificationCredentialsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const visible = CREDENTIALS.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.platform.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-neutral-900">Verification Credentials</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">Every credential generated from your FOID identity, and where it's been shared</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full font-semibold text-[14px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors shrink-0 self-start">
          <RemixIcon name="ri-download-2-line" size={20} /> Download Identity Summary
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Credentials" value="6"       sub="Shared across 6 platforms"      subColor="text-neutral-400"             icon="ri-file-text-fill"         />
        <StatCard label="Shared With"        value="6 apps"  sub="Banks, loans & merchants"     subColor="text-neutral-400"             icon="ri-user-shared-2-fill" />
        <StatCard label="Expiring Soon"      value="1"       sub="Renew within 30 days"      subColor="text-green-600 font-semibold" icon="ri-alarm-warning-fill"  />
        <StatCard label="Revoked"            value="2"       sub="Access removed by you"           subColor="text-neutral-400"             icon="ri-close-circle-fill"    />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
          {/* Sliding-pill segmented control */}
          <div className="overflow-x-auto w-full sm:w-auto">
            <SegmentedTabs value={filter} onChange={setFilter} tabs={TABS} />
          </div>

          {/* Search */}
          <div className="sm:ml-auto relative w-full sm:w-[280px]">
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

        {/* Table — horizontally scrollable on mobile */}
        <div className="overflow-x-auto">
        <table className="w-full text-left text-[16px] border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-neutral-200">
              {['CREDENTIAL ID', 'SHARED WITH', 'SCOPE', 'ISSUED', 'EXPIRES', 'STATUS', 'ACTIONS'].map((col, i, arr) => (
                <th
                  key={col}
                  className={[
                    'px-6 py-4 text-[16px] font-semibold text-black uppercase tracking-widest whitespace-nowrap',
                    i === 0             ? 'rounded-tl-xl' : '',
                    i === arr.length - 1 ? 'rounded-tr-xl' : '',
                  ].join(' ')}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((cred, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors">
                {/* Credential ID */}
                <td className="px-6 py-5 text-black">{cred.id}</td>

                {/* Shared with — bank logo + name */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={cred.logo}
                      alt={cred.platform}
                      className="w-9 h-9 rounded-lg object-contain shrink-0 border border-neutral-100 bg-white p-0.5"
                    />
                    <span className="font-semibold text-neutral-900 whitespace-nowrap">{cred.platform}</span>
                  </div>
                </td>

                {/* Scope */}
                <td className="px-6 py-5 text-neutral-600 max-w-[160px]">{cred.scope}</td>

                {/* Issued */}
                <td className="px-6 py-5 text-neutral-500 whitespace-nowrap">{cred.issued}</td>

                {/* Expires */}
                <td className="px-6 py-5   text-neutral-500 whitespace-nowrap">{cred.expires ?? '—'}</td>

                {/* Status */}
                <td className="px-6 py-5"><StatusBadge status={cred.status} /></td>

                {/* Actions */}
                <td className="px-6 py-5"><ActionButton status={cred.status} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                  No credentials match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  )
}
