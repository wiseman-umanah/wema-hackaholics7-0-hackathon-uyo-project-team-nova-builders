import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar.tsx'
import Topbar from '@/components/Topbar.tsx'
import AiChat from '@/components/AiChat.tsx'

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar drawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto py-8 md:py-12 bg-white px-4 md:px-8">
          <Outlet />
        </main>
      </div>
      <AiChat />
    </div>
  )
}
