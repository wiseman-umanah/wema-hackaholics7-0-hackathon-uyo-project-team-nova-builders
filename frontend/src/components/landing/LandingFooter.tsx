import { Link } from 'react-router-dom'

export default function LandingFooter() {
  return (
    <footer style={{ background: '#000000', overflow: 'hidden' }}>

      {/* Giant "Foid" wordmark — full-width bleed, bottom half clipped */}
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '50vw',
            fontWeight: 1000,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          Foid
        </span>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
		className='max-w-[95%] sm:px-10 py-6  border-t border-neutral-600'
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
        <p 
			className='font-semibold'
			style={{ color: '#ffffff', fontSize: 13, margin: 0 }}
		>
          &copy; {new Date().getFullYear()} FOID. Built for Nigerian founders and freelancers.
        </p>
      </div>

    </footer>
  )
}
