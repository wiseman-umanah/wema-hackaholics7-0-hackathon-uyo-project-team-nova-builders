import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar.tsx'
import Topbar from '@/components/Topbar.tsx'
import '@/styles/layout.css'

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
