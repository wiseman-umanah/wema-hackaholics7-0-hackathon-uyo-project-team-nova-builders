// import RemixIcon from '@/components/RemixIcon'
import StatCard from '@/components/StatCard'

/* ── Page ───────────────────────────────────────────────────────────── */
export default function AiCreditWallet() {
   return (
	  <div className="flex flex-col gap-6">
  
		{/* ── Header ── */}
		<div>
		  <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">AI Credit Wallet</h1>
		  <p className="text-neutral-500 mt-1 text-[13.5px]">
			No subscriptions — just pay-as-you-go credits for AI-powered features
		  </p>
		</div>
  
		{/* ── Stat cards ── */}
		<div className="grid grid-cols-4 gap-4">
		  <StatCard
			label="Current Balance"
			value="8,420"
			sub="Covers ~52 more days"
			subColor="text-neutral-400"
			icon="ri-wallet-3-line"
		  />
		  <StatCard
			label="Used This Month"
			value="1,180"
			sub="Across 295 AI actions"
			subColor="text-neutral-400"
			icon="ri-activity-line"
		  />
		  <StatCard
			label="Purchased This Month"
			value="10,000"
			sub="Growth pack"
			subColor="text-neutral-400"
			icon="ri-shopping-cart-line"
		  />
		  <StatCard
			label="Avg. Daily Usage"
			value="39 cr"
			sub="Last 30 days"
			subColor="text-neutral-400"
			icon="ri-line-chart-line"
		  />
		</div>

		{/* ── Balance and Usage Sections ── */}
		<div className="grid grid-cols-3 gap-6">
		  {/* Balance Card */}
		  <div className="col-span-1">
			<div className="bg-gradient-to-br from-[#C800DE] to-[#9000A8] rounded-2xl p-6 text-white">
			  <div className="flex items-center justify-between mb-4">
				<span className="text-sm font-medium opacity-90">Your balance</span>
				<span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">Active</span>
			  </div>
			  <div className="text-4xl font-bold mb-2">8,420 credits</div>
			  <div className="text-sm opacity-80 mb-4">Auto Top-Up At 500 credits</div>
			  <div className="text-xs opacity-60 mb-6">LAST PURCHASE 01 Jul 2026</div>
			  <div className="flex gap-3">
				<button className="flex-1 bg-white text-[#C800DE] py-2.5 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
				  Buy Credit
				</button>
				<button className="flex-1 bg-white/20 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors">
				  Auto Top-up
				</button>
			  </div>
			</div>
		  </div>

		  {/* Recent Usage */}
		  <div className="col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
			<h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent usage</h3>
			<table className="w-full">
			  <thead>
				<tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
				  <th className="pb-3 font-medium">MONTH</th>
				  <th className="pb-3 font-medium">FEATURE</th>
				  <th className="pb-3 font-medium text-right">CREDITS USED</th>
				</tr>
			  </thead>
			  <tbody className="text-sm">
				<tr className="border-b border-neutral-100">
				  <td className="py-3 text-neutral-600">14 Jul, 10:22</td>
				  <td className="py-3 text-neutral-900">Receipt scan - Uber invoice</td>
				  <td className="py-3 text-right text-red-600 font-medium">-4</td>
				</tr>
				<tr className="border-b border-neutral-100">
				  <td className="py-3 text-neutral-600">Jun 2026</td>
				  <td className="py-3 text-neutral-900">Chat - spending summary</td>
				  <td className="py-3 text-right text-red-600 font-medium">-1</td>
				</tr>
				<tr className="border-b border-neutral-100">
				  <td className="py-3 text-neutral-600">May 2026</td>
				  <td className="py-3 text-neutral-900">Tax estimate query</td>
				  <td className="py-3 text-right text-red-600 font-medium">-1</td>
				</tr>
				<tr>
				  <td className="py-3 text-neutral-600">Apr 2026</td>
				  <td className="py-3 text-neutral-900">Identity verification - Carbon</td>
				  <td className="py-3 text-right text-red-600 font-medium">-1</td>
				</tr>
			  </tbody>
			</table>
		  </div>
		</div>

		{/* Purchase History */}
		<div className="bg-white rounded-2xl border border-neutral-200 p-6">
		  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Purchase history</h3>
		  <table className="w-full">
			<thead>
			  <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
				<th className="pb-3 font-medium">DATE</th>
				<th className="pb-3 font-medium">PACKAGE</th>
				<th className="pb-3 font-medium">CREDITS</th>
				<th className="pb-3 font-medium">AMOUNT</th>
				<th className="pb-3 font-medium">STATUS</th>
			  </tr>
			</thead>
			<tbody className="text-sm">
			  <tr className="border-b border-neutral-100">
				<td className="py-3 text-neutral-600">01 Jul 2026</td>
				<td className="py-3 text-neutral-900 font-medium">Growth pack</td>
				<td className="py-3 text-green-600 font-medium">+10,000</td>
				<td className="py-3 text-neutral-900">₦45,000</td>
				<td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span></td>
			  </tr>
			  <tr className="border-b border-neutral-100">
				<td className="py-3 text-neutral-600">01 Jun 2026</td>
				<td className="py-3 text-neutral-900 font-medium">Growth pack</td>
				<td className="py-3 text-green-600 font-medium">+10,000</td>
				<td className="py-3 text-neutral-900">₦45,000</td>
				<td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span></td>
			  </tr>
			  <tr className="border-b border-neutral-100">
				<td className="py-3 text-neutral-600">14 May 2026</td>
				<td className="py-3 text-neutral-900 font-medium">Top-up</td>
				<td className="py-3 text-green-600 font-medium">+2,500</td>
				<td className="py-3 text-neutral-900">₦12,500</td>
				<td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span></td>
			  </tr>
			  <tr>
				<td className="py-3 text-neutral-600">01 May 2026</td>
				<td className="py-3 text-neutral-900 font-medium">Starter pack</td>
				<td className="py-3 text-green-600 font-medium">+5,000</td>
				<td className="py-3 text-neutral-900">₦25,000</td>
				<td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span></td>
			  </tr>
			</tbody>
		  </table>
		</div>
  
	  </div>
	)
}

