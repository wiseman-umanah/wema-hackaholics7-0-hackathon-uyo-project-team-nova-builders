import StatCard from '@/components/StatCard'
import RemixIcon from '@/components/RemixIcon'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

/* ── Colours ────────────────────────────────────────────────────────── */
const BRAND      = '#c026d3'
const BRAND_LITE = '#f5d0fe'
const PINK       = '#e879f9'

/* ── Helpers ────────────────────────────────────────────────────────── */
const naira = (n: number) => '₦' + n.toLocaleString('en-NG')

/* ── Mock data ──────────────────────────────────────────────────────── */
const incomeExpenseData = [
  { x: '0', income: 32000,  expense: 28000  },
  { x: '1', income: 90000,  expense: 55000  },
  { x: '2', income: 64000,  expense: 80000  },
  { x: '3', income: 50000,  expense: 22000  },
  { x: '4', income: 120000, expense: 95000  },
  { x: '5', income: 75000,  expense: 45000  },
  { x: '6', income: 129000, expense: 110000 },
  { x: '7', income: 129000, expense: 109000 },
]

const incomeSourcesData = [
  { source: 'Client Sales', amount: 160000 },
  { source: 'Retainer',     amount: 110000 },
  { source: 'Others',       amount:  70000 },
]

const monthlySummary = [
  { month: 'Jul 2026', income: 2140500, expense: 1382900, net: 757600,  tax: 412600 },
  { month: 'Jun 2026', income: 1974000, expense: 1310200, net: 663800,  tax: 368900 },
  { month: 'May 2026', income: 1882400, expense: 1244600, net: 637800,  tax: 351200 },
  { month: 'Apr 2026', income: 1905100, expense: 1268300, net: 636800,  tax: 347500 },
]

/* ── Page ───────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Reports & Insights</h1>
          <p className="text-neutral-500 mt-1 text-[13.5px]">
            A closer look at your cash flow, spending patterns, and tax position
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full font-semibold text-[13px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-text-line" size={16} color="#18181b" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full font-semibold text-[13px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-pdf-2-line" size={16} color="#18181b" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Net Cash Flow"
          value="2,614"
          sub="↗ Positive for 6 months straight"
          subColor="text-brand-500 font-semibold"
          icon="ri-bar-chart-fill"
        />
        <StatCard
          label="Avg. Monthly Income"
          value="₦1,980,200"
          sub="Last 6 months"
          subColor="text-neutral-400"
          icon="ri-arrow-left-down-long-line"
        />
        <StatCard
          label="Avg. Monthly Expense"
          value="₦1,290,800"
          sub="Last 6 months"
          subColor="text-neutral-400"
          icon="ri-arrow-up-right-line"
        />
        <StatCard
          label="Savings Rate"
          value="34.8%"
          sub="↗ +2.1pp vs last quarter"
          subColor="text-brand-500 font-semibold"
          icon="ri-wallet-line"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-[1fr_380px] gap-5">

        {/* Income vs expenses — area chart */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="font-bold text-[15px] text-neutral-900 mb-0.5">Income vs. expenses</div>
          <div className="text-[12px] text-neutral-400 mb-4">Last 14 days across all connected banks</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={incomeExpenseData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rGradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"   stopColor={BRAND}      stopOpacity={0.25} />
                  <stop offset="95%"  stopColor={BRAND}      stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rGradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"   stopColor={BRAND_LITE} stopOpacity={0.45} />
                  <stop offset="95%"  stopColor={BRAND_LITE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `₦${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                width={52}
              />
              <Tooltip
                formatter={(val, name) => [naira(Number(val)), name === 'income' ? 'Income' : 'Expenses']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
              />
              <Area type="monotone" dataKey="income"
                stroke={BRAND} strokeWidth={2} fill="url(#rGradIncome)"
                dot={{ r: 3, fill: '#fff', stroke: BRAND, strokeWidth: 2 }}
                activeDot={{ r: 4, fill: BRAND }}
              />
              <Area type="monotone" dataKey="expense"
                stroke={PINK} strokeWidth={2} fill="url(#rGradExpense)"
                dot={{ r: 3, fill: '#fff', stroke: PINK, strokeWidth: 2 }}
                activeDot={{ r: 4, fill: PINK }}
              />
              <Legend
                verticalAlign="bottom" align="right"
                iconType="circle" iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => (
                  <span style={{ color: '#71717a' }}>
                    {value === 'income' ? 'Income' : 'Expenses'}
                  </span>
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Income Sources — bar chart */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="font-bold text-[15px] text-neutral-900 mb-4">Income Sources</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeSourcesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={60} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `₦${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                width={52}
              />
              <Tooltip
                formatter={(val) => [naira(Number(val)), 'Amount']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
              />
              <Bar dataKey="amount" fill={BRAND} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Monthly summary table ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="font-bold text-[15px] text-neutral-900">Monthly summary</div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {['MONTH', 'INCOME', 'EXPENSES', 'NET', 'EST. TAX', 'ACTIONS'].map((col, i, arr) => (
                <th
                  key={col}
                  className={[
                    'px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap',
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
            {monthlySummary.map((row, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors">
                <td className="px-6 py-5 text-[14px] font-semibold text-neutral-900">{row.month}</td>
                <td className="px-6 py-5 text-[13px] text-neutral-700">{naira(row.income)}</td>
                <td className="px-6 py-5 text-[13px] text-neutral-700">{naira(row.expense)}</td>
                <td className="px-6 py-5 text-[13px] text-neutral-700">{naira(row.net)}</td>
                <td className="px-6 py-5 text-[13px] text-neutral-700">{naira(row.tax)}</td>
                <td className="px-6 py-5">
                  <button className="flex items-center gap-2 px-4 py-1.5 border border-neutral-200 rounded-full text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <RemixIcon name="ri-download-fill" size={14} color="#52525b" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
