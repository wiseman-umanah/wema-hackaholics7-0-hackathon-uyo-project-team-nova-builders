import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar.tsx'
import Topbar from '@/components/Topbar.tsx'
import AiChat from '@/components/AiChat.tsx'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto py-12 bg-white px-8">
          <Outlet />
        </main>
      </div>
      <AiChat />
    </div>
  )
}
