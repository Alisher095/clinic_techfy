import React, { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '../store'
import { formatAppointmentTime, getStatusColor } from '../utils'
import { Search, Filter, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Clock, RefreshCw, Bell } from 'lucide-react'
import AppointmentModal from '../components/AppointmentModal'

function Dashboard() {
  const appointments = useAppStore(state => state.appointments)
  const patients = useAppStore(state => state.patients)
  const loadAppointments = useAppStore(state => state.loadAppointments)
  const appointmentsLoading = useAppStore(state => state.appointmentsLoading)
  const appointmentsError = useAppStore(state => state.appointmentsError)
  const loadAlerts = useAppStore(state => state.loadAlerts)
  const alerts = useAppStore(state => state.alerts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeRange, setTimeRange] = useState(720)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAlertList, setShowAlertList] = useState(true)
  
  const appointmentsInRange = useMemo(() => {
    const now = new Date()
    const endTime = new Date(now.getTime() + timeRange * 60 * 60 * 1000)
    
    return appointments
      .filter(apt => {
        const appointmentDate = new Date(apt.dateTime)
        return appointmentDate >= now && appointmentDate <= endTime
      })
      .filter(apt => {
        if (statusFilter !== 'all' && apt.insuranceStatus !== statusFilter) {
          return false
        }
        if (searchTerm && !apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        return true
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
  }, [appointments, searchTerm, statusFilter, timeRange])
  
  const stats = {
    total: appointmentsInRange.length,
    verified: appointmentsInRange.filter(a => a.insuranceStatus === 'Verified').length,
    needsReview: appointmentsInRange.filter(a => a.insuranceStatus === 'Needs Review').length,
    expired: appointmentsInRange.filter(a => a.insuranceStatus === 'Expired').length,
  }

  useEffect(() => {
    loadAppointments()
    loadAlerts()
  }, [loadAppointments, loadAlerts])

  // Auto-refresh appointments every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAppointments()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [loadAppointments])
  
  return (
    <div className="p-4 md:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-healthcare-blue/10 to-blue-500/10 dark:from-healthcare-blue/20 dark:to-blue-500/20 rounded-xl p-8 border border-healthcare-blue/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-healthcare-blue to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">Appointment Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage insurance verification for upcoming appointments</p>
          </div>
          <button
            onClick={() => loadAppointments()}
            className="flex items-center gap-2 px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Appointments"
          value={stats.total}
          icon={Clock}
          color="bg-blue-500"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          label="Needs Review"
          value={stats.needsReview}
          icon={AlertCircle}
          color="bg-amber-500"
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>
      
      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Expired">Expired</option>
          </select>
          
          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input-field"
          >
            <option value={48}>Next 48 Hours</option>
            <option value={72}>Next 72 Hours</option>
            <option value={168}>Next 7 Days</option>
            <option value={720}>Next 30 Days</option>
          </select>
        </div>
      </div>
      
      {/* Alerts Panel */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
            <Bell size={20} className="text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Active Alerts</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAlertList(prev => !prev)}
              className="ml-auto flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {showAlertList ? 'Hide alerts' : 'Show alerts'}
              <ChevronDown
                size={16}
                className={`transition-transform ${showAlertList ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
          </div>
          {showAlertList ? (
            <div className="space-y-3">
              {alerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{alert.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      useAppStore.getState().resolveAlert(alert.id)
                    }}
                    className="px-2 py-1 text-xs bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-600 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">Alerts are hidden. Click the button to reveal them.</div>
          )}
        </div>
      )}
      
      {/* Appointments List */}
      <div className="card overflow-hidden">
        {appointmentsLoading ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading appointments...</p>
          </div>
        ) : appointmentsError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{appointmentsError}</p>
            <button
              onClick={() => loadAppointments()}
              className="mt-4 px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : appointmentsInRange.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Appointment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Insurance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Copay</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsInRange.map(apt => (
                  <tr
                    key={apt.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{apt.patientName}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{apt.type || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{formatAppointmentTime(apt.dateTime)}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{apt.provider || '—'} • {apt.location || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{apt.insurance}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusColor(apt.insuranceStatus)}`}>
                        {apt.insuranceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {apt.copay ? `$${apt.copay}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-healthcare-blue hover:text-blue-700 font-medium flex items-center gap-1 ml-auto"
                      >
                        View
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No appointments found in this time range</p>
          </div>
        )}
      </div>

      {/* Recent Patients */}
      <div className="card mt-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Patients</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Newest registered patients from your clinic</p>
        </div>
        {patients.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {patients.slice(0, 6).map(patient => (
              <div key={patient.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">ID: {patient.id}</p>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB not available'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            No patients found
          </div>
        )}
      </div>
      
      {/* Appointment Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
