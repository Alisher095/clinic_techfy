import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../store'
import {
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  Zap,
  Shield,
  Moon,
  Sun,
  Activity,
  Calendar
} from 'lucide-react'

function Navigation({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)
  const user = useAuthStore(state => state.user)
  const theme = useAppStore(state => state.theme)
  const toggleTheme = useAppStore(state => state.toggleTheme)
  
  const isActive = (path) => location.pathname === path
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: Shield, label: 'Payer Simulator', path: '/payer-simulator' },
    { icon: Zap, label: 'AI Orchestrator', path: '/ai-orchestrator' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav className={`
        fixed md:relative left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col z-40
        transform transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-healthcare-blue rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100">HealthCare</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Dashboard Pro</p>
            </div>
          </div>
          
          {/* User Profile Section */}
          {user && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=0F6BFF&color=fff&size=32`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {user?.role === 'admin' ? 'Admin' :
                     user?.role === 'billing' ? 'Billing' :
                     'Front Desk'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-healthcare-blue text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon size={20} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={20} />
                <span>Light Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              logout()
              onClose()
              navigate('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navigation
