import { NavLink, useNavigate } from 'react-router-dom'
import '@/styles/layout.css'

const NAV_ITEMS = [
  { to: '/dashboard',             icon: 'ri-dashboard-line',         label: 'Overview' },
  { to: '/dashboard/identity',    icon: 'ri-user-line',              label: 'My Identity' },
  { to: '/dashboard/banks',       icon: 'ri-bank-line',              label: 'Connected Banks' },
  { to: '/dashboard/credentials', icon: 'ri-shield-check-line',      label: 'Verification Credentials' },
  { to: '/dashboard/consents',    icon: 'ri-file-list-3-line',       label: 'Consent Requests' },
  { to: '/dashboard/ledger',      icon: 'ri-briefcase-line',         label: 'Business Ledger' },
  { to: '/dashboard/history',     icon: 'ri-history-line',           label: 'Ledger History' },
  { to: '/dashboard/wallet',      icon: 'ri-ai-generate',            label: 'AI Credit Wallet' },
  { to: '/dashboard/reports',     icon: 'ri-bar-chart-line',         label: 'Reports & Insights' },
  { to: '/dashboard/settings',    icon: 'ri-settings-3-line',        label: 'Profile & Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">F</div>
        <span className="sidebar-logo-text">Foid</span>
        <button className="sidebar-toggle" aria-label="Toggle sidebar">
          <i className="ri-layout-right-line" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <i className={`nav-icon ${item.icon}`} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={() => navigate('/')}>
          <i className="nav-icon ri-logout-box-r-line" />
          Logout
        </button>
      </div>
    </aside>
  )
}
