import { Link } from 'react-router-dom'
import FoidWordmark from '@/components/FoidWordmark'

export default function LandingFooter() {
  return (
    <footer
      className="min-h-screen"
      style={{ background: '#000000', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >

      {/* Giant "Foid" wordmark — grows to fill ~95% of the footer height */}
      <div
        aria-hidden="true"
        style={{
          flex: '1 1 0',           /* takes all available space above the bottom bar */
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',    /* vertically centre inside the flex area */
        }}
      >
        <FoidWordmark color="#ffffff" height={500} />
      </div>

      {/* Bottom bar — fixed height, sits at the bottom */}
      <div
        className="max-w-[1100px] sm:px-10 py-6 border-t border-neutral-600"
        style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="FOID" className="h-9 w-auto object-contain" />
          <span
            className='font-ultrabold'
            style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.4px', color: '#FFFFFF' }}
          >
            Foid
          </span>
        </Link>
        <p className="font-semibold" style={{ color: '#ffffff', fontSize: 13, margin: 0 }}>
          &copy; {new Date().getFullYear()} FOID. Built for Nigerian founders and freelancers.
        </p>
      </div>

    </footer>
  )
}
