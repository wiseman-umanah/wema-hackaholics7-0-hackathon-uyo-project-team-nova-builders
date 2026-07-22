import { Link } from 'react-router-dom'

const BRAND = '#c026d3'

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-40 bg-white py-6 ">
      <div className="max-w-[95%] mx-auto sm:px-10 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="FOID" className="h-9 w-auto object-contain" />
          <span 
		  	className='font-ultrabold'
		  	style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.4px', color: '#18181b' }}
			>
            Foid
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 text-[16px] font-regular text-black">
          <a href="#features" className="hover:text-neutral-900 transition-colors">Product</a>
          <a href="#how"      className="hover:text-neutral-900 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-neutral-900 transition-colors">AI Ledger</a>
          <a href="#stats"    className="hover:text-neutral-900 transition-colors">Trust</a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-[76px] py-3 rounded-full text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center px-5 py-3 rounded-full text-[13px] font-bold transition-colors hover:bg-neutral-50"
            style={{ border: `1.5px solid ${BRAND}`, color: BRAND }}
          >
            Get your FOID
          </Link>
        </div>
      </div>
    </nav>
  )
}
