import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'

/* ── Page ───────────────────────────────────────────────────────────── */
export default function LedgerHistory() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Ledger History</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Every AI-generated ledger entry — searchable, editable, and exportable
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-full text-[13px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-text-line" size={16} color="#18181b" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-full text-[13px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-pdf-2-line" size={16} color="#18181b" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Entries"
          value="2,614"
          sub="Since your account began"
          subColor="text-neutral-400"
          icon="ri-list-check-3"
        />
        <StatCard
          label="Auto-categorised"
          value="97.1%"
          sub="Without manual edits"
          subColor="text-neutral-400"
          icon="ri-arrow-right-up-line"
        />
        <StatCard
          label="Exports This Month"
          value="9"
          sub="CSV & PDF combined"
          subColor="text-neutral-400"
          icon="ri-bar-chart-fill"
        />
        <StatCard
          label="Estimated Tax"
          value="Unlimited"
          sub="Full history kept, always"
          subColor="text-neutral-400"
          icon="ri-inbox-line"
        />
      </div>

    </div>
  )
}
