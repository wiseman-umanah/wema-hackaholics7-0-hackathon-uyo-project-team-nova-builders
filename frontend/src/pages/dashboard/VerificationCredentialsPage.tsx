import { useState } from 'react'

/* ── Types ──────────────────────────────────────────────────────────── */
type CredentialStatus = 'active' | 'expiring' | 'revoked'

interface Credential {
  id: string
  platform: string
  avatarInitial: string
  avatarColor: string
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
    avatarInitial: 'W',
    avatarColor: 'bg-brand-500',
    scope: 'KYC · Full',
    issued: '12 Jul 2026',
    expires: '12 Jun 2027',
    status: 'active',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'GTBank',
    avatarInitial: 'G',
    avatarColor: 'bg-orange-500',
    scope: 'Loan · Income verification',
    issued: '03 Jul 2026',
    expires: '03 Jul 2027',
    status: 'active',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'Opay',
    avatarInitial: 'O',
    avatarColor: 'bg-green-500',
    scope: 'Merchant KYC',
    issued: '29 Aug 2025',
    expires: '29 Jul 2026',
    status: 'expiring',
  },
  {
    id: 'foid_cr_8x291a...e7d40',
    platform: 'Renmoney',
    avatarInitial: 'R',
    avatarColor: 'bg-neutral-500',
    scope: 'Full KYC + transactions',
    issued: '02 Feb 2026',
    expires: null,
    status: 'revoked',
  },
]

/* ── Stat card ──────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, subColor = 'text-neutral-400', icon,
}: {
  label: string; value: string; sub: string; subColor?: string; icon: string
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 relative flex-1">
      <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-500 text-[18px]">
        <i className={icon} />
      </div>
      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-neutral-900 mb-1">{value}</div>
      <div className={`text-[12px] font-medium ${subColor}`}>{sub}</div>
    </div>
  )
}

/* ── Status badge ───────────────────────────────────────────────────── */
const STATUS_STYLES: Record<CredentialStatus, string> = {
  active:   'bg-green-100 text-green-700',
  expiring: 'bg-orange-100 text-orange-600',
  revoked:  'bg-red-100 text-red-600',
}

function StatusBadge({ status }: { status: CredentialStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold capitalize ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ── Action button ──────────────────────────────────────────────────── */
function ActionButton({ status }: { status: CredentialStatus }) {
  const label = status === 'expiring' ? 'Renew' : 'Revoke'
  const style = status === 'revoked'
    ? 'border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
  return (
    <button
      disabled={status === 'revoked'}
      className={`px-4 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${style}`}
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Verification Credentials</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Every credential generated from your FOID identity, and where it's been shared
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-lg font-semibold text-[14px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors shrink-0">
          <i className="ri-download-2-line" /> Download Identity Summary
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="flex gap-4">
        <StatCard label="Active Credentials" value="6"       sub="Shared across 6 platforms"      subColor="text-neutral-400"             icon="ri-bank-line"         />
        <StatCard label="Shared With"        value="6 apps"  sub="Tier 2 · Full KYC complete"     subColor="text-neutral-400"             icon="ri-shield-check-line" />
        <StatCard label="Expiring Soon"      value="1"       sub="Shared across 6 platforms"      subColor="text-brand-500 font-semibold" icon="ri-file-list-3-line"  />
        <StatCard label="Revoked"            value="2"       sub="Covers ~52 more days"           subColor="text-neutral-400"             icon="ri-quill-pen-line"    />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          {/* Filter tabs */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={[
                  'px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                  filter === tab.key
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="ml-auto relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[14px] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by platform"
              className="pl-8 pr-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 w-52"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {['CREDENTIAL ID', 'SHARED WITH', 'SCOPE', 'ISSUED', 'EXPIRES', 'STATUS', 'ACTIONS'].map(col => (
                <th key={col} className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((cred, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4 text-[13px] text-neutral-500 font-mono">{cred.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${cred.avatarColor} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>
                      {cred.avatarInitial}
                    </div>
                    <span className="text-[13.5px] font-semibold text-neutral-900">{cred.platform}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] text-neutral-600">{cred.scope}</td>
                <td className="px-5 py-4 text-[13px] text-neutral-500 whitespace-nowrap">{cred.issued}</td>
                <td className="px-5 py-4 text-[13px] text-neutral-500 whitespace-nowrap">{cred.expires ?? '—'}</td>
                <td className="px-5 py-4"><StatusBadge status={cred.status} /></td>
                <td className="px-5 py-4"><ActionButton status={cred.status} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-neutral-400">
                  No credentials match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
