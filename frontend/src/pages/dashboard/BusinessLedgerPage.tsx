import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'

/* ── Page ───────────────────────────────────────────────────────────── */
export default function BusinessLedger() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Business Ledger</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            Snap a receipt, forward an invoice, or just ask — FOID's AI keeps your books for you
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[14px] text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ background: '#c026d3' }}
        >
          <RemixIcon name="ri-camera-fill" size={18} color="#fff" />
          Scan receipt
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Income (MTD)"
          value="₦2,140,500"
          sub="↗ +8.4% vs last month"
          subColor="text-brand-500 font-semibold"
          icon="ri-arrow-left-down-long-line"
        />
        <StatCard
          label="Total Expenses (MTD)"
          value="₦1,382,900"
          sub="64.6% of income"
          subColor="text-neutral-400"
          icon="ri-arrow-right-up-long-line"
        />
        <StatCard
          label="Net Profit"
          value="₦757,600"
          sub="↗ Shared across 6 platforms"
          subColor="text-brand-500 font-semibold"
          icon="ri-bar-chart-fill"
        />
        <StatCard
          label="Estimated Tax"
          value="₦412,600"
          sub="Set aside for this quarter"
          subColor="text-neutral-400"
          icon="ri-bank-fill"
        />
      </div>

    </div>
  )
}
