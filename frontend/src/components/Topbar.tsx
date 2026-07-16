import '@/styles/layout.css'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <i className="ri-search-line topbar-search-icon" />
        <input
          type="text"
          placeholder="Search your credentials, banks, transactions"
          aria-label="Search"
        />
      </div>

      <div className="topbar-actions">
        <button className="topbar-notif" aria-label="Notifications">
          <i className="ri-notification-3-line" />
          <span className="topbar-notif-dot" />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">AS</div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">Alex Sterling</div>
            <div className="topbar-user-badge">Verified</div>
          </div>
        </div>
      </div>
    </header>
  )
}
