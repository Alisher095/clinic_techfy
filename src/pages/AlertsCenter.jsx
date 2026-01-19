import React, { useState } from 'react'
import { useAppStore } from '../store'
import { formatTimeAgo, getSeverityColor } from '../utils'
import { AlertCircle, CheckCircle, Trash2, Filter } from 'lucide-react'

function AlertsCenter() {
  const alerts = useAppStore(state => state.alerts)
  const removeAlert = useAppStore(state => state.removeAlert)
  const resolveAlert = useAppStore(state => state.resolveAlert)
  const [filterType, setFilterType] = useState('all')
  
  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true
    if (filterType === 'unresolved') return !alert.resolved
    if (filterType === 'resolved') return alert.resolved
    return true
  })
  
  const unresolvedCount = alerts.filter(a => !a.resolved).length
  
  return (
    <div className="p-4 md:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 rounded-xl p-8 border border-red-500/20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent mb-2">Alerts Center</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Manage insurance verification alerts and warnings</p>
      </div>
      
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Alerts</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{alerts.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Unresolved</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{unresolvedCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{alerts.filter(a => a.resolved).length}</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-slate-600 dark:text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 input-field"
          >
            <option value="all">All Alerts</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`card p-6 border-l-4 transition-all ${
                alert.resolved
                  ? 'border-l-green-500 opacity-75'
                  : getSeverityColor(alert.severity) === 'badge-error'
                  ? 'border-l-red-500'
                  : 'border-l-amber-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 ${
                    alert.severity === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {alert.resolved ? (
                      <CheckCircle size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {alert.title}
                      </h3>
                      <span className={`badge ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="badge badge-success">Resolved</span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{alert.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {formatTimeAgo(alert.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No alerts to display</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsCenter
