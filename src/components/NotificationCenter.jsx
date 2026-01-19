import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { Bell, X } from 'lucide-react'

function NotificationCenter({ unreadCount }) {
  const [isOpen, setIsOpen] = useState(false)
  const alerts = useAppStore(state => state.alerts)
  const removeAlert = useAppStore(state => state.removeAlert)
  const resolveAlert = useAppStore(state => state.resolveAlert)
  const navigate = useNavigate()
  
  const unresolvedAlerts = alerts.filter(a => !a.resolved).slice(0, 5)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
          </div>
          
          {unresolvedAlerts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {unresolvedAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors last:border-b-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      navigate(`/appointment/${alert.appointmentId}`)
                      setIsOpen(false)
                    }}>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{alert.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              <p>No notifications</p>
            </div>
          )}
          
          {alerts.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  navigate('/alerts')
                  setIsOpen(false)
                }}
                className="w-full text-center text-sm font-medium text-healthcare-blue hover:text-blue-700"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
