import { useState } from 'react'
import RemixIcon from '../../components/RemixIcon'
import StatCard from '../../components/StatCard'

/* ── Toggle switch ───────────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 48,
        height: 28,
        borderRadius: 999,
        background: on ? '#c026d3' : '#d4d4d8',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 200ms ease',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 200ms ease',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        }}
      />
    </button>
  )
}

/* ── Text input ──────────────────────────────────────────────────────── */
function Field({ label, placeholder = 'Input text', wide = false }: { label: string; placeholder?: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <label className="block text-[13px] font-medium text-neutral-800 mb-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[13px] text-neutral-500 placeholder:text-neutral-400 outline-none focus:border-brand-400 transition-colors"
      />
    </div>
  )
}

/* ── Identity doc row ────────────────────────────────────────────────── */
type DocStatus = 'verified' | 'not-linked'
function DocRow({ icon, name, sub, status }: { icon: string; name: string; sub: string; status: DocStatus }) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-neutral-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
        <RemixIcon name={icon} size={18} color="#fff" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-neutral-900">{name}</div>
        <div className="text-[11px] text-neutral-400">{sub}</div>
      </div>
      {status === 'verified' ? (
        <span className="flex items-center gap-1.5 rounded-full bg-brand-500 text-white text-[11px] font-semibold px-3 py-1">
          <RemixIcon name="ri-checkbox-circle-fill" size={13} color="#fff" />
          Verified
        </span>
      ) : (
        <button className="text-[12px] font-semibold text-neutral-800 hover:text-brand-500 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50">
          Add
        </button>
      )}
    </div>
  )
}

/* ── Security toggle row ─────────────────────────────────────────────── */
function SecurityRow({ label, sub, on, onChange }: { label: string; sub: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div>
        <div className="text-[13px] font-semibold text-neutral-900">{label}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

/* ── Notification preference row ─────────────────────────────────────── */
function PrefRow({ label, sub, on, onChange }: { label: string; sub: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-neutral-100 last:border-0">
      <div className="pr-6">
        <div className="text-[13px] font-semibold text-neutral-900">{label}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════ */
export default function ProfileSettingsPage() {
  /* Security toggles */
  const [twoFa, setTwoFa]         = useState(true)
  const [biometric, setBiometric] = useState(true)
  const [loginAlerts, setLogin]   = useState(true)

  /* Notification / AI preference toggles */
  const [verificationAlerts, setVerification] = useState(true)
  const [consentAlerts, setConsent]           = useState(true)
  const [aiNudges, setAiNudges]               = useState(true)
  const [weeklyDigest, setWeekly]             = useState(false)

  return (
    <div className="flex flex-col gap-6 min-h-full">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Profile &amp; Settings</h1>
          <p className="text-[13px] text-neutral-400 mt-1">
            Manage your personal information, security, and how FOID's AI helps you
          </p>
        </div>
        <div className="flex gap-3 shrink-0 flex-wrap">
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-excel-2-line" size={16} color="#52525b" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">
            <RemixIcon name="ri-file-pdf-2-line" size={16} color="#52525b" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Account Tier"
          value="Tier 2"
          sub="Full KYC complete"
          subColor="text-neutral-400"
          icon="ri-shield-star-fill"
        />
        <StatCard
          label="Identity Documents"
          value="3 / 4"
          sub="1 document not linked"
          subColor="text-neutral-400"
          icon="ri-profile-fill"
        />
        <StatCard
          label="Active Consents"
          value="11"
          sub="Across 6 platforms"
          subColor="text-neutral-400"
          icon="ri-checkbox-circle-fill"
        />
        <StatCard
          label="Last Login"
          value="Just now"
          sub="2FA · Biometric active"
          subColor="text-green-600 font-semibold"
          icon="ri-lock-2-fill"
        />
      </div>

      {/* ── Two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Personal information ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-5">Personal information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" />
            <Field label="Last name" />
            <Field label="Middle name" />
            <Field label="NIN" />
            <Field label="Address" wide />
          </div>
        </div>

        {/* ── Linked identity documents ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-4">Linked identity documents</h2>
          <div className="divide-y divide-neutral-100">
            <DocRow icon="ri-bank-fill"       name="BVN"                   sub="Linked and Verified"  status="verified"    />
            <DocRow icon="ri-profile-fill"          name="NIN"                   sub="Linked and Verified"  status="verified"    />
            <DocRow icon="ri-passport-fill"         name="International passport" sub="Not linked"           status="not-linked"  />
            <DocRow icon="ri-lightbulb-flash-fill"        name="Utility bill"           sub="Linked and Verified"  status="verified"    />
          </div>
        </div>

        {/* ── Security ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-2">Security</h2>
          <div>
            <SecurityRow
              label="Two-factor authentication"
              sub="Require a code from your phone when signing in"
              on={twoFa}
              onChange={() => setTwoFa(v => !v)}
            />
            <SecurityRow
              label="Biometric unlock"
              sub="Use Face ID / fingerprint on this device"
              on={biometric}
              onChange={() => setBiometric(v => !v)}
            />
            <SecurityRow
              label="Login alerts"
              sub="Email me when there's a new sign-in"
              on={loginAlerts}
              onChange={() => setLogin(v => !v)}
            />
          </div>
          <button className="mt-5 w-full rounded-xl border border-neutral-200 bg-white py-3 text-[13px] font-bold text-neutral-900 hover:bg-neutral-50 transition-colors">
            Change Password
          </button>
        </div>

        {/* ── Notifications & AI preferences ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-2">Notifications &amp; AI preferences</h2>
          <div>
            <PrefRow
              label="Verification request alerts"
              sub="Notify me when a platform wants to verify my identity"
              on={verificationAlerts}
              onChange={() => setVerification(v => !v)}
            />
            <PrefRow
              label="Consent request alerts"
              sub="Notify me when an app requests my data"
              on={consentAlerts}
              onChange={() => setConsent(v => !v)}
            />
            <PrefRow
              label="AI budget nudges"
              sub="Let the assistant surface spending insights proactively"
              on={aiNudges}
              onChange={() => setAiNudges(v => !v)}
            />
            <PrefRow
              label="Weekly digest email"
              sub="Summary of your finances and credential activity"
              on={weeklyDigest}
              onChange={() => setWeekly(v => !v)}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
