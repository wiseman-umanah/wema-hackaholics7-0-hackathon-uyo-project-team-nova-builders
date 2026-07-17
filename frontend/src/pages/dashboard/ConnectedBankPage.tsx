import { useState } from 'react'
import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'
import IncomeExpenseChart from '@/components/IncomeExpenseChart'

/* ── Types ──────────────────────────────────────────────────────────── */
type BankStatus = 'active' | 'syncing' | 'error' | 'disconnected'

interface BankAccount {
  id: string
  name: string
  logo: string
  accountType: string
  accountNumber: string
  balance: number
  currency: string
  linkedDate: string
  lastSync: string
  status: BankStatus
  transactions: number
}

/* ── Mock data ──────────────────────────────────────────────────────── */
const BANKS: BankAccount[] = [
  {
    id: '1',
    name: 'Wema Bank',
    logo: '/wema.jpg',
    accountType: 'Current Account',
    accountNumber: '****  ****  ****  4821',
    balance: 1_420_500,
    currency: '₦',
    linkedDate: '12 Jun 2026',
    lastSync: '2 min ago',
    status: 'active',
    transactions: 284,
  },
  {
    id: '2',
    name: 'GT Bank',
    logo: '/GTCO.jpg',
    accountType: 'Savings Account',
    accountNumber: '****  ****  ****  7302',
    balance: 520_000,
    currency: '₦',
    linkedDate: '12 Jun 2026',
    lastSync: '5 min ago',
    status: 'active',
    transactions: 119,
  },
  {
    id: '3',
    name: 'Kuda Bank',
    logo: '/kuda.jpg',
    accountType: 'Digital Account',
    accountNumber: '****  ****  ****  0194',
    balance: 85_300,
    currency: '₦',
    linkedDate: '03 Jul 2026',
    lastSync: 'Syncing…',
    status: 'syncing',
    transactions: 47,
  },
  {
    id: '4',
    name: 'Opay',
    logo: '/opay.png',
    accountType: 'Wallet',
    accountNumber: '****  ****  ****  6650',
    balance: 0,
    currency: '₦',
    linkedDate: '20 May 2026',
    lastSync: '2 hr ago',
    status: 'error',
    transactions: 61,
  },
]

/* ── Available banks to connect ─────────────────────────────────────── */
const ADD_OPTIONS = [
  { name: 'Renmoney',     logo: '/renmoney.jpg' },
  { name: 'Zenith Bank',  logo: '/wema.jpg'     },
  { name: 'Access Bank',  logo: '/GTCO.jpg'     },
  { name: 'First Bank',   logo: '/kuda.jpg'     },
]

/* ── Status metadata ────────────────────────────────────────────────── */
const STATUS_META: Record<BankStatus, { label: string; bg: string; color: string; dot: string }> = {
  active:       { label: 'Active',       bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  syncing:      { label: 'Syncing…',     bg: '#eff6ff', color: '#1d4ed8', dot: '#60a5fa' },
  error:        { label: 'Error',        bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
  disconnected: { label: 'Disconnected', bg: '#f4f4f5', color: '#71717a', dot: '#a1a1aa' },
}

const naira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 })

/* ── Status badge ───────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: BankStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: m.dot }}
      />
      {m.label}
    </span>
  )
}

/* ── Bank card (grid tile) ──────────────────────────────────────────── */
function BankCard({
  bank,
  onDisconnect,
}: {
  bank: BankAccount
  onDisconnect: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow relative">
      {/* Top row: logo + name + kebab */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src={bank.logo}
            alt={bank.name}
            className="w-10 h-10 rounded-xl object-contain border border-neutral-100 bg-white p-0.5 shrink-0"
          />
          <div>
            <div className="text-[14px] font-bold text-neutral-900 leading-tight">{bank.name}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">{bank.accountType}</div>
          </div>
        </div>

        {/* Kebab menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Account options"
          >
            <RemixIcon name="ri-more-2-fill" size={16} color="#a1a1aa" clickable />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 min-w-[160px]"
              >
                <button className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                  <RemixIcon name="ri-refresh-line" size={14} color="#71717a" clickable />
                  Sync now
                </button>
                <button className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                  <RemixIcon name="ri-eye-line" size={14} color="#71717a" clickable />
                  View transactions
                </button>
                <div className="h-px bg-neutral-100 my-1" />
                <button
                  onClick={() => { onDisconnect(bank.id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <RemixIcon name="ri-link-unlink" size={14} color="#ef4444" clickable />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account number */}
      <div className="text-[13px] font-mono text-neutral-500 tracking-wider">{bank.accountNumber}</div>

      {/* Balance */}
      <div>
        <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide mb-0.5">Available balance</div>
        <div className="text-[22px] font-extrabold text-neutral-900 leading-none">
          {bank.status === 'error' ? '—' : naira(bank.balance)}
        </div>
      </div>

      {/* Footer: status + sync time */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
        <StatusBadge status={bank.status} />
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <RemixIcon name="ri-time-line" size={12} color="#a1a1aa" />
          {bank.lastSync}
        </div>
      </div>

      {/* Transactions pill */}
      <div className="text-[11px] text-neutral-400">
        <span className="font-semibold text-neutral-700">{bank.transactions}</span> transactions synced
      </div>
    </div>
  )
}

/* ── Add-bank modal ─────────────────────────────────────────────────── */
function AddBankModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-neutral-900">Connect a bank account</h2>
            <p className="text-[12.5px] text-neutral-400 mt-0.5">
              Read-only Open Banking access via Mono/Okra sandbox
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors shrink-0"
          >
            <RemixIcon name="ri-close-line" size={18} color="#71717a" clickable />
          </button>
        </div>

        {/* Bank grid */}
        <div className="grid grid-cols-2 gap-3">
          {ADD_OPTIONS.map(opt => (
            <button
              key={opt.name}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-left"
            >
              <img
                src={opt.logo}
                alt={opt.name}
                className="w-9 h-9 rounded-lg object-contain border border-neutral-100 bg-white p-0.5 shrink-0"
              />
              <span className="text-[13px] font-semibold text-neutral-800 leading-tight">{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-neutral-50 rounded-xl px-4 py-3">
          <RemixIcon name="ri-shield-check-line" size={15} color="#a1a1aa" className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-neutral-500 leading-relaxed">
            FOID only reads transaction data. We never store credentials or move funds.
            Connection uses the CBN-licensed Open Banking sandbox.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function ConnectedBankPage() {
  const [banks, setBanks] = useState<BankAccount[]>(BANKS)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDisconnect = (id: string) =>
    setBanks(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'disconnected' as BankStatus } : b)
    )

  const activeCount     = banks.filter(b => b.status === 'active').length
  const totalBalance    = banks.filter(b => b.status === 'active').reduce((s, b) => s + b.balance, 0)
  const totalTx         = banks.reduce((s, b) => s + b.transactions, 0)
  const errorCount      = banks.filter(b => b.status === 'error').length

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-neutral-900">Connected Bank Accounts</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Manage the banks and fintechs linked to your FOID identity via Open Banking
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[14px] text-white transition-opacity hover:opacity-90 shrink-0 self-start"
          style={{ background: '#c026d3' }}
        >
          <RemixIcon name="ri-add-line" size={18} color="#fff" clickable />
          Connect a Bank
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Connected Banks"
          value={String(banks.filter(b => b.status !== 'disconnected').length)}
          sub={`${activeCount} active · ${errorCount > 0 ? errorCount + ' need attention' : 'all healthy'}`}
          subColor={errorCount > 0 ? 'text-red-500 font-semibold' : 'text-brand-500 font-semibold'}
          icon="ri-bank-line"
        />
        <StatCard
          label="Total Balance"
          value={`₦${(totalBalance / 1_000_000).toFixed(2)}M`}
          sub="Across active accounts"
          subColor="text-neutral-400"
          icon="₦"
        />
        <StatCard
          label="Transactions Synced"
          value={String(totalTx)}
          sub="Last 90 days"
          subColor="text-neutral-400"
          icon="ri-exchange-line"
        />
        <StatCard
          label="Identity Verification"
          value="Verified"
          sub="Tier 2 · Full KYC complete"
          subColor="text-neutral-400"
          icon="ri-shield-user-line"
        />
      </div>

      {/* ── Bank cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {banks.map(bank => (
          <BankCard key={bank.id} bank={bank} onDisconnect={handleDisconnect} />
        ))}
      </div>

      {/* ── Income / Expense chart ── */}
      <IncomeExpenseChart
        title="Cash flow across connected banks"
        subtitle="Income and expenses from all linked accounts — last 7 weeks"
      />

      {/* ── Add bank modal ── */}
      {showAddModal && <AddBankModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
