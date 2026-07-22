import StatCard from '@/components/StatCard'



/* ── Recent usage ────────────────────────────────────────────────────── */
const RECENT_USAGE = [
  { date: '14 Jul, 10:22', feature: 'Receipt scan — Uber invoice',      credits: -4  },
  { date: '14 Jul, 09:14', feature: 'Chat — spending summary',           credits: -1  },
  { date: '13 Jul, 17:44', feature: 'Receipt scan — Studio Kola',        credits: -4  },
  { date: '13 Jul, 11:00', feature: 'Tax estimate query',                credits: -1  },
  { date: '12 Jul, 15:30', feature: 'Identity verification — Carbon',    credits: -1  },
  { date: '11 Jul, 08:05', feature: 'Receipt scan — Notion + Figma',     credits: -4  },
]

/* ── Purchase history ────────────────────────────────────────────────── */
const PURCHASES = [
  { date: '01 Jul 2026', pack: 'Growth pack',   credits: '+10,000', amount: '₦45,000', status: 'Paid'    },
  { date: '01 Jun 2026', pack: 'Growth pack',   credits: '+10,000', amount: '₦45,000', status: 'Paid'    },
  { date: '14 May 2026', pack: 'Top-up',        credits: '+2,500',  amount: '₦12,500', status: 'Paid'    },
  { date: '01 May 2026', pack: 'Starter pack',  credits: '+5,000',  amount: '₦25,000', status: 'Paid'    },
]

/* ── Page ───────────────────────────────────────────────────────────── */
export default function AiCreditWallet() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-neutral-900">AI Credit Wallet</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            No subscriptions — pay-as-you-go credits for AI-powered features
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-semibold text-[14px] transition-colors shrink-0 w-full sm:w-auto justify-center">
          Buy Credits
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Balance"     value="8,420"    sub="Covers ~52 more days"           subColor="text-neutral-400"            icon="ri-quill-pen-fill"      />
        <StatCard label="Used This Month"     value="1,180"    sub="Across 295 AI actions"          subColor="text-neutral-400"            icon="ri-flashlight-fill"      />
        <StatCard label="Purchased This Month" value="10,000"  sub="Growth pack · 01 Jul 2026"      subColor="text-neutral-400"            icon="ri-handbag-fill" />
        <StatCard label="Avg. Daily Usage"    value="39 cr"   sub="Last 30 days"                   subColor="text-neutral-400"            icon="ri-bar-chart-fill"    />
      </div>

      {/* ── Balance card + recent usage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Balance card column ── */}
        <div className="flex flex-col justify-between gap-3">

          {/* Outer grey shell */}
          <div className="rounded-3xl p-4">
            {/* Inner gradient card with noise texture */}
            <div
              className="rounded-2xl p-8 text-white flex flex-col gap-4 min-h-[250px] relative overflow-hidden"
              style={{ background: 'linear-gradient(90deg, #8A0194 0%, #2B002E 100%)' }}
            >
              {/* noise texture overlay */}
              <img
                src="/card-back.png"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
              />

              {/* Top row: amount + Active badge */}
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[28px] font-extrabold leading-none tracking-tight">8,420 credits</div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 shrink-0">Active</span>
              </div>

              {/* Bottom row: auto top-up info + last purchase + logo */}
              <div className="relative flex items-end justify-between mt-auto">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Auto Top-Up</span>
                  <span className="text-[13px] font-semibold">At 500 credits</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Last Purchase</span>
                  <span className="text-[13px] font-semibold">01 Jul 2026</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
					<img src="/logo.png" alt="FOID" className="h-9 w-auto object-contain" />
					<span 
					className='font-ultrabold'
					style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.4px', color: '#ffffff' }}
					>
					Foid
					</span>
				</div>
              </div>
            </div>
          </div>

          {/* Action buttons — outside the card */}
          <div className="flex gap-3">
            <button
              className="flex-1 py-2.5 rounded-full text-[13px] font-bold border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-neutral-900"
            >
              Buy Credit
            </button>
            <button
              className="flex-1 py-2.5 rounded-full text-[13px] font-bold border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-neutral-900"
            >
              Auto Top-up
            </button>
          </div>
        </div>

        {/* Recent usage table */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="font-bold text-[15px] text-neutral-900 mb-4">Recent usage</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[380px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['MONTH', 'FEATURE', 'CREDITS USED'].map(col => (
                    <th key={col} className="pb-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap px-2 last:text-right">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_USAGE.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-2 text-[13px] text-neutral-500 whitespace-nowrap">{row.date}</td>
                    <td className="py-4 px-2 text-[13px] text-neutral-900">{row.feature}</td>
                    <td className="py-4 px-2 text-[13px] font-bold text-right text-neutral-900">{row.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Purchase history ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="font-bold text-[15px] text-neutral-900">Purchase history</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-neutral-100">
                {['DATE', 'PACKAGE', 'CREDITS', 'AMOUNT', 'STATUS'].map(col => (
                  <th key={col} className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PURCHASES.map((row, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors">
                  <td className="px-6 py-4 text-[13px] text-neutral-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-neutral-900">{row.pack}</td>
                  <td className="px-6 py-4 text-[13px] font-bold text-green-600">{row.credits}</td>
                  <td className="px-6 py-4 text-[13px] text-neutral-700">{row.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
