import React, { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL, useAuthStore, useAppStore } from '../store'
import { Zap, Check, AlertCircle, Activity, TrendingUp, Clock, Settings, BarChart3 } from 'lucide-react'

const DEFAULT_LOGS = [
  {
    timestamp: new Date(Date.now() - 5 * 60000),
    patient: 'John Smith',
    insurance: 'Blue Cross',
    result: 'Verified',
    duration: '1.2s'
  },
  {
    timestamp: new Date(Date.now() - 12 * 60000),
    patient: 'Sarah Johnson',
    insurance: 'Aetna',
    result: 'Needs Review',
    duration: '2.1s'
  },
  {
    timestamp: new Date(Date.now() - 25 * 60000),
    patient: 'Michael Brown',
    insurance: 'Cigna',
    result: 'Expired',
    duration: '0.8s'
  },
  {
    timestamp: new Date(Date.now() - 45 * 60000),
    patient: 'Emily Davis',
    insurance: 'UnitedHealth',
    result: 'Verified',
    duration: '1.5s'
  },
]

function AIOrchestrator() {
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationError, setSimulationError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const user = useAuthStore(state => state.user)
  const { appointments, alerts, loadAppointments, loadAlerts } = useAppStore((state) => ({
    appointments: state.appointments,
    alerts: state.alerts,
    loadAppointments: state.loadAppointments,
    loadAlerts: state.loadAlerts
  }))
  
  // Role-based access check
  const isAdmin = user?.role === 'admin'
  const canModifyRules = isAdmin
  
  const failedFromAppointments = appointments.filter(a => a.insuranceStatus === 'Expired').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  const stats = {
    scanned: appointments.length,
    verified: appointments.filter(a => a.insuranceStatus === 'Verified').length,
    needsReview: appointments.filter(a => a.insuranceStatus === 'Needs Review').length,
    failed: Math.max(failedFromAppointments, criticalAlerts)
  }
  
  const verificationRate = Math.round((stats.verified / stats.scanned) * 100) || 0
  const averageProcessingTime = 1.4 // seconds
  const uptime = 99.9 // percent
  
  const workflowSteps = [
    { id: 1, name: 'Scan Appointments', status: 'completed', icon: Check },
    { id: 2, name: 'Identify Insurance', status: 'completed', icon: Check },
    { id: 3, name: 'Verify Eligibility', status: 'completed', icon: Check },
    { id: 4, name: 'Apply Rules', status: 'completed', icon: Check },
    { id: 5, name: 'Update Dashboard', status: 'completed', icon: Check },
  ]
  
  const rules = [
    {
      name: 'Expired Insurance Detection',
      description: 'Automatically flag appointments where insurance has expired',
      status: 'active',
      impact: 'Critical'
    },
    {
      name: 'Missing Copay Information',
      description: 'Alert when copay information is not available',
      status: 'active',
      impact: 'High'
    },
    {
      name: 'High Deductible Risk',
      description: 'Flag patients with remaining deductible > $2000',
      status: 'active',
      impact: 'Medium'
    },
    {
      name: 'Same-Day Verification',
      description: 'Re-verify insurance for appointments within 24 hours',
      status: 'active',
      impact: 'High'
    }
  ]
  
  const recentLogs = useMemo(() => {
    if (!appointments.length) {
      return DEFAULT_LOGS
    }
    const sorted = [...appointments].sort((a, b) => {
      const aTime = new Date(a.lastVerified || a.dateTime || 0).getTime()
      const bTime = new Date(b.lastVerified || b.dateTime || 0).getTime()
      return bTime - aTime
    })
    return sorted.slice(0, 4).map((appointment) => ({
      timestamp: new Date(appointment.lastVerified || appointment.dateTime || Date.now()),
      patient: appointment.patientName || 'Unknown patient',
      insurance: appointment.insurance || 'Unknown payer',
      result: appointment.insuranceStatus || 'Needs Review',
      duration: appointment.processingTime || '1.2s'
    }))
  }, [appointments])
  
  useEffect(() => {
    loadAppointments().catch(() => {})
    loadAlerts().catch(() => {})
  }, [loadAlerts, loadAppointments])

  const handleRunSimulation = async () => {
    setSimulationRunning(true)
    setSimulationError('')
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/insurance/simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Simulation request failed')
      }
      await response.json()
      await loadAppointments()
      await loadAlerts()
    } catch (error) {
      console.error('Simulation failed', error)
      setSimulationError(error.message || 'Simulation failed')
    } finally {
      setSimulationRunning(false)
    }
  }
  
  return (
    <div className="p-4 md:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-xl p-8 border border-purple-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">AI Orchestrator</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Automated insurance verification workflow management</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">System Active</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Uptime: {uptime}%</p>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'rules', label: 'Rules Engine', icon: Settings },
          { id: 'logs', label: 'Verification Logs', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Scanned" value={stats.scanned} icon="🔍" trend="+5" />
            <StatCard label="Verified" value={stats.verified} icon="✅" trend="+3" />
            <StatCard label="Needs Review" value={stats.needsReview} icon="⚠️" trend="-1" />
            <StatCard label="Failed" value={stats.failed} icon="❌" trend="0" />
          </div>
          
          {/* Main Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Workflow Visualization */}
            <div className="md:col-span-2">
              <div className="card p-6 h-full">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Verification Workflow</h2>
                
                <div className="space-y-4 mb-6">
                  {workflowSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                          ✓
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{step.name}</span>
                      </div>
                      {idx < workflowSteps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-green-500 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Status:</strong> All verification steps completed successfully
                  </p>
                </div>
              </div>
            </div>
            
            {/* Verification Rate & Controls */}
            <div className="card p-6 h-full flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Verification Rate</h2>
              
              <div className="flex-1 flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${Math.PI * 100 * (verificationRate / 100)} ${Math.PI * 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{verificationRate}%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRunSimulation}
                disabled={simulationRunning}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                {simulationRunning ? 'Running...' : 'Run Simulation'}
              </button>
              {simulationError && (
                <p className="text-xs text-red-500 mt-2">{simulationError}</p>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Key Metrics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Clock size={18} />
                  Avg Processing Time
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{averageProcessingTime}s</span>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Throughput (24h)</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.scanned * 24}</span>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Uptime</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{uptime}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Error Rate</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">0.1%</span>
              </div>
            </div>
          </div>
          
          {/* System Health */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">System Health</h2>
            
            <div className="space-y-4">
              <HealthIndicator label="API Connectivity" status="healthy" />
              <HealthIndicator label="Database Connection" status="healthy" />
              <HealthIndicator label="Memory Usage" status="healthy" />
              <HealthIndicator label="Cache System" status="healthy" />
              <HealthIndicator label="Queue Processing" status="warning" />
            </div>
          </div>
        </div>
      )}
      
      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Rules Engine</h2>
            {canModifyRules && (
              <button className="btn btn-outline text-sm">
                <Settings size={16} />
                Configure Rules
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{rule.name}</h3>
                  <span className="badge badge-success text-xs">Active</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{rule.description}</p>
                <p className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Impact: </span>
                  <span className={`font-medium ${
                    rule.impact === 'Critical' ? 'text-red-600' :
                    rule.impact === 'High' ? 'text-amber-600' :
                    'text-blue-600'
                  }`}>
                    {rule.impact}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Recent Verification Logs</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Insurance</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Result</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {log.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-medium">{log.patient}</td>
                    <td className="py-3 px-4">{log.insurance}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        log.result === 'Verified' ? 'badge-success' :
                        log.result === 'Needs Review' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, trend }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.startsWith('+') ? 'text-green-600' : trend === '0' ? 'text-slate-600' : 'text-red-600'}`}>
              {trend} this hour
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function HealthIndicator({ label, status }) {
  const statusColors = {
    healthy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.healthy}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  )
}

export default AIOrchestrator
