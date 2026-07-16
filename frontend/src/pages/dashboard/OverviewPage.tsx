import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import '@/styles/overview.css'

/* ── Mock data ──────────────────────────────────────────────────────── */
const incomeExpenseData = [
  { x: '0', income: 32000,  expense: 28000 },
  { x: '1', income: 90000,  expense: 55000 },
  { x: '2', income: 64000,  expense: 80000 },
  { x: '3', income: 50000,  expense: 22000 },
  { x: '4', income: 120000, expense: 95000 },
  { x: '5', income: 75000,  expense: 45000 },
  { x: '6', income: 129000, expense: 110000 },
]

const credentialUsageData = [
  { platform: 'Wema',     pulls: 80 },
  { platform: 'Carbon',   pulls: 35 },
  { platform: 'Opay',     pulls: 68 },
  { platform: 'Kuda',     pulls: 18 },
  { platform: 'GT Bank',  pulls: 22 },
]

const spendingCategories = [
  { label: 'Payroll',   pct: 46, color: '#9333ea' },
  { label: 'Logistics', pct: 31, color: '#16a34a' },
  { label: 'Other',     pct: 23, color: '#d97706' },
]

/* ── Naira formatter ────────────────────────────────────────────────── */
const naira = (n: number) =>
  '₦' + n.toLocaleString('en-NG')

/* ── Donut SVG ──────────────────────────────────────────────────────── */
function SpendingDonut() {
  const r = 40
  const cx = 55
  const cy = 55
  const circumference = 2 * Math.PI * r
  const segments = [
    { pct: 46, color: '#9333ea', offset: 0 },
    { pct: 31, color: '#16a34a', offset: 46 },
    { pct: 23, color: '#d97706', offset: 77 },
  ]

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {segments.map((s, i) => {
        const dashLen = (s.pct / 100) * circumference
        const gapLen  = circumference - dashLen
        const rotate  = (s.offset / 100) * 360 - 90
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${dashLen} ${gapLen}`}
            transform={`rotate(${rotate} ${cx} ${cy})`}
          />
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#6b7280">₦</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">Total</text>
    </svg>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string
  value: string
  sub: string
  subVariant?: 'default' | 'positive' | 'green'
  icon: string
}

function StatCard({ label, value, sub, subVariant = 'default', icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon"><i className={icon} /></div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${value === 'Verified' ? 'verified' : ''}`}>{value}</div>
      <div className={`stat-sub ${subVariant}`}>{sub}</div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function OverviewPage() {
  return (
    <>
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Welcome back, Daniel</h1>
          <p className="overview-subtitle">
            Here's a snapshot of your identity, credentials, and business finances
          </p>
        </div>
        <button className="btn-connect-bank">
          + Connect a Bank
        </button>
      </div>

      {/* Row 1 — stat cards */}
      <div className="stat-grid">
        <StatCard
          label="Connected Banks"
          value="12,482"
          sub="↗ GT Banks, Kuda +2 More"
          subVariant="positive"
          icon="ri-bank-line"
        />
        <StatCard
          label="Identity Verification"
          value="Verified"
          sub="Tier 2 · Full KYC complete"
          icon="ri-shield-check-line"
        />
        <StatCard
          label="Active Credentials"
          value="156"
          sub="Shared across 6 platforms"
          subVariant="green"
          icon="ri-medal-line"
        />
        <StatCard
          label="AI Credit Balance"
          value="8420"
          sub="Covers ~52 more days"
          icon="ri-ai-generate"
        />
      </div>

      {/* Row 2 — stat cards */}
      <div className="stat-grid">
        <StatCard
          label="Monthly Income"
          value={naira(2140500)}
          sub="Per creator weekly"
          icon="ri-money-naira-circle-line"
        />
        <StatCard
          label="Monthly Expense"
          value={naira(2140500)}
          sub="Per creator weekly"
          icon="ri-arrow-up-circle-line"
        />
        <StatCard
          label="Estimated Taxes"
          value={naira(412600)}
          sub="Per creator weekly"
          icon="ri-percent-line"
        />
        <StatCard
          label="Verification Requests"
          value="3"
          sub="This week · 1 needs your action"
          icon="ri-file-list-3-line"
        />
      </div>

      {/* Charts + credential card row */}
      <div className="charts-row">
        {/* Income vs expenses area chart */}
        <div className="card">
          <div className="card-title">Income vs. expenses</div>
          <div className="card-sub">Last 14 days across all connected banks</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={incomeExpenseData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9333ea" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e879f9" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#e879f9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₦${v >= 1000 ? v / 1000 + 'k' : v}`}
              />
              <Tooltip
                formatter={(val) => [naira(Number(val)), '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Area type="monotone" dataKey="income"  stroke="#9333ea" strokeWidth={2} fill="url(#gradIncome)"  dot={{ r: 3, fill: '#9333ea' }} />
              <Area type="monotone" dataKey="expense" stroke="#e879f9" strokeWidth={2} fill="url(#gradExpense)" dot={{ r: 3, fill: '#e879f9' }} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: '#9333ea' }} />
              Income
            </div>
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: '#e879f9', opacity: 0.6 }} />
              Expenses
            </div>
          </div>
        </div>

        {/* Credential card */}
        <div className="card">
          <div className="card-title">Your verification credential</div>

          <div className="credential-card-wrap">
            <div className="credential-card-bg-orb" />
            <div className="credential-card-bg-orb2" />

            <div className="credential-card-logo">FOID</div>
            <div className="credential-card-verified-badge">Verified</div>

            {/* Decorative SVG rings */}
            <svg
              style={{ position: 'absolute', right: 20, top: 20, opacity: 0.55 }}
              width="110" height="110" viewBox="0 0 110 110"
              aria-hidden="true"
            >
              <ellipse cx="55" cy="55" rx="50" ry="28" fill="none" stroke="#f59e0b" strokeWidth="8" transform="rotate(-30 55 55)" />
              <ellipse cx="55" cy="55" rx="50" ry="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" transform="rotate(30 55 55)" />
              <ellipse cx="55" cy="55" rx="32" ry="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
            </svg>

            <div className="credential-card-field-label">CREDENTIAL STATE</div>
            <div className="credential-card-field-value">7654</div>

            <div className="credential-card-field-label">HOLDER</div>
            <div className="credential-card-holder">Daniel A.</div>
          </div>

          <button className="btn-view-foid-code">
            <i className="ri-qr-code-line" /> View my FOID code
          </button>

          <div style={{ position: 'relative', height: 24 }}>
            <div className="foid-fab">F</div>
          </div>
        </div>
      </div>

      {/* Bottom row — credential usage + spending breakdown */}
      <div className="bottom-row">
        {/* Bar chart: where credential is used */}
        <div className="card">
          <div className="card-title">Where your credential is used</div>
          <div className="card-sub">Verification pulls by connected platforms</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={credentialUsageData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="pulls" radius={[5, 5, 0, 0]} maxBarSize={52}>
                {credentialUsageData.map((entry, index) => (
                  <Cell
                    key={entry.platform}
                    fill={index % 2 === 0 ? '#7c3aed' : '#e9d5ff'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending breakdown */}
        <div className="card">
          <div className="card-title">Spending breakdown</div>
          <div className="card-sub">This month, by category</div>

          <div className="spending-donut-wrap">
            <SpendingDonut />
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
              {spendingCategories.map(c => (
                <div key={c.label} style={{ marginBottom: 2 }}>
                  <span style={{ color: c.color, fontWeight: 700 }}>{c.pct}%</span> {c.label}
                </div>
              ))}
            </div>
          </div>

          <div className="spending-legend">
            {spendingCategories.map(c => (
              <div className="legend-row" key={c.label}>
                <span style={{ width: 60, fontSize: 13 }}>{c.label}</span>
                <div className="legend-bar-track">
                  <div
                    className="legend-bar-fill"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 32, textAlign: 'right' }}>
                  {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
