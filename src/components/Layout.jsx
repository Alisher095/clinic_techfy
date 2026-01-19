import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../store'
import Navigation from './Navigation'
import NotificationCenter from './NotificationCenter'
import { Menu, X, Bell, LogOut, User } from 'lucide-react'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const alerts = useAppStore(state => state.alerts)
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()
  
  useEffect(() => {
    const unresolvedCount = alerts.filter(a => !a.resolved).length
    setUnreadAlerts(unresolvedCount)
  }, [alerts])
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex-1 px-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user?.clinic}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user?.name} • {user?.role}
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <NotificationCenter unreadCount={unreadAlerts} />
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=0F6BFF&color=fff`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </button>
              
              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-healthcare-blue/10 to-blue-500/10 dark:from-healthcare-blue/20 dark:to-blue-500/20 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=0F6BFF&color=fff&size=40`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Role</p>
                    <div className="inline-block">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user?.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        user?.role === 'billing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        {user?.role === 'admin' ? 'Administrator' :
                         user?.role === 'billing' ? 'Billing Staff' :
                         'Front Desk Staff'}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Clinic</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{user?.clinic}</p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      logout()
                      setProfileOpen(false)
                      navigate('/login')
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm rounded-b-xl"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
