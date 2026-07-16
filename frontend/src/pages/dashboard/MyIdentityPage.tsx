import '@/styles/identity.css'

/* ── Verification step data ─────────────────────────────────────────── */
const VERIF_STEPS = [
  { label: 'Phone',    icon: 'ri-smartphone-line',    done: true  },
  { label: 'Email',    icon: 'ri-mail-line',           done: true  },
  { label: 'BVN',      icon: 'ri-bank-line',           done: true  },
  { label: 'NIN',      icon: 'ri-shield-user-line',    done: false },
  { label: 'Liveness', icon: 'ri-camera-line',         done: false },
]

/* ── Linked accounts data ───────────────────────────────────────────── */
const LINKED_ACCOUNTS = [
  { name: 'Wema Bank', date: 'Linked 12 Jun 2026', initials: 'W' },
  { name: 'GT Bank',   date: 'Linked 12 Jun 2026', initials: 'G' },
]

/* ── Trust ring SVG ─────────────────────────────────────────────────── */
function TrustRing({ pct }: { pct: number }) {
  const r   = 38
  const circ = 2 * Math.PI * r
  const fill = (pct / 100) * circ

  return (
    <div className="trust-ring">
      <svg width="90" height="90" viewBox="0 0 90 90">
        {/* track */}
        <circle cx="45" cy="45" r={r} fill="none" stroke="#f3e8ff" strokeWidth="8" />
        {/* fill */}
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke="url(#trustGrad)"
          strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="trust-ring-label">
        <span className="trust-ring-pct">{pct}%</span>
        <span className="trust-ring-word">Trust</span>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function MyIdentityPage() {
  return (
    <>
      {/* Header */}
      <div className="identity-header">
        <div>
          <h1 className="identity-title">My Identity</h1>
          <p className="identity-subtitle">
            Your verified digital identity, generated once and reusable everywhere
          </p>
        </div>
        <button className="btn-download">
          <i className="ri-download-2-line" /> Download Identity Summary
        </button>
      </div>

      {/* Hero card — avatar + name + trust ring */}
      <div className="identity-hero">
        <div className="identity-avatar-wrap">
          <div className="identity-avatar-placeholder">DA</div>
        </div>

        <div>
          <div className="identity-name">Daniel Afolabi</div>
          <span className="tier-badge">Tier 2 · Fully verified</span>
        </div>

        <div className="identity-trust">
          <TrustRing pct={98} />
          <div className="trust-score-info">
            <div className="trust-score-caption">Trust Score</div>
            <div className="trust-score-value">98.4/100</div>
            <div className="trust-score-rank">Top 8% of verified FOID users</div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="identity-bottom-row">
        {/* Verification progress */}
        <div className="verif-card">
          <div className="verif-title">Verification progress</div>
          <div className="verif-sub">All steps complete — your identity credential is fully active</div>

          <div className="verif-steps">
            {VERIF_STEPS.map((step, i) => {
              // connector after this step should be grey if next step is incomplete
              const nextIncomplete = i < VERIF_STEPS.length - 1 && !VERIF_STEPS[i + 1].done
              return (
                <div
                  key={step.label}
                  className={[
                    'verif-step',
                    !step.done ? 'incomplete' : '',
                    nextIncomplete ? 'after-incomplete' : '',
                  ].join(' ')}
                >
                  <div className={`verif-icon${step.done ? '' : ' incomplete'}`}>
                    <i className={step.icon} />
                  </div>
                  <div className="verif-step-label">{step.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Linked accounts */}
        <div className="linked-card">
          <div className="linked-title">Linked accounts &amp; credentials</div>
          {LINKED_ACCOUNTS.map(acct => (
            <div className="linked-item" key={acct.name}>
              <div className="linked-bank-logo">{acct.initials}</div>
              <div className="linked-bank-info">
                <div className="linked-bank-name">{acct.name}</div>
                <div className="linked-bank-date">{acct.date}</div>
              </div>
              <span className="linked-badge">Linked</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
