import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'



/* ── Page ───────────────────────────────────────────────────────────── */
export default function ConnectedBankPage() {
  return (
	<div className="flex flex-col gap-5">

	  {/* ── Header ── */}
	  <div className="flex items-start justify-between">
		<div>
		  <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">Connected Bank Accounts</h1>
		  <p className="text-neutral-500 mt-1 text-[13.5px]">Manage the banks and fintechs linked to your FOID identity via Open Banking</p>
		</div>
		<button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full font-semibold text-[14px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors shrink-0">
		  <RemixIcon name="ri-download-2-line" size={20} /> Download Identity Summary
		</button>
	  </div>

		<div>
			<div className="grid grid-cols-4 gap-4">
				<StatCard label="Connected Banks"      value="12,482"          sub="↗ GT Banks, Kuda +2 More"          subColor="text-brand-500 font-semibold" icon="ri-bank-line" />
				<StatCard label="Identity Verification" value="Verified"        sub="Tier 2 · Full KYC complete"        subColor="text-neutral-400"              icon="ri-shield-user-line" />
				<StatCard label="Active Credentials"    value="156"             sub="Shared across 6 platforms"         subColor="text-green-600 font-semibold"  icon="ri-book-read-fill" />
				<StatCard label="AI Credit Balance"     value="8420"            sub="Covers ~52 more days"              subColor="text-neutral-400"              icon="ri-quill-pen-fill" />
			</div>
		</div>
	</div>
  )
}
