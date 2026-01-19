import React, { useState, useMemo } from 'react'
import { useAuthStore, useAppStore, API_BASE_URL } from '../store'
import { Calendar, Clock, MapPin, Phone, LogOut, Plus, Search, Filter } from 'lucide-react'

function PatientDashboard() {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const appointments = useAppStore(state => state.appointments)
  const loadPatientAppointments = useAppStore(state => state.loadPatientAppointments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Filter appointments for current patient
  const patientAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = (a.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.clinic || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || a.appointmentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [appointments, searchTerm, statusFilter])

  const stats = {
    upcoming: patientAppointments.filter(a => a.appointmentStatus === 'Upcoming').length,
    completed: patientAppointments.filter(a => a.appointmentStatus === 'Completed').length,
    total: patientAppointments.length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'Blocked':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-healthcare-blue to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Patient'}</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Patient Portal</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              window.location.href = '/patient-login'
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-healthcare-blue/10 to-blue-600/10 dark:from-healthcare-blue/20 dark:to-blue-600/20 rounded-xl p-6 border border-healthcare-blue/20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your appointments and health information in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Appointments</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Upcoming</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.upcoming}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.completed}</p>
          </div>
        </div>

        {/* Schedule New Appointment Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-healthcare-blue to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <Plus size={20} />
            Schedule New Appointment
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
          >
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {patientAppointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center border border-slate-200 dark:border-slate-700">
              <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">No appointments found</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-4 text-healthcare-blue hover:text-blue-700 font-semibold"
              >
                Schedule your first appointment
              </button>
            </div>
          ) : (
            patientAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:border-healthcare-blue dark:hover:border-healthcare-blue transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {appointment.type || 'Appointment'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">ID: {appointment.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.appointmentStatus)}`}>
                    {appointment.appointmentStatus}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Calendar size={18} className="text-healthcare-blue flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Date</p>
                      <p className="font-medium">{new Date(appointment.dateTime).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Clock size={18} className="text-healthcare-blue flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Time</p>
                      <p className="font-medium">{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <MapPin size={18} className="text-healthcare-blue flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Location</p>
                      <p className="font-medium">{appointment.clinic || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Phone size={18} className="text-healthcare-blue flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Provider</p>
                      <p className="font-medium">{appointment.provider || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>

                {appointment.insuranceStatus && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Insurance Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.insuranceStatus === 'Verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      appointment.insuranceStatus === 'Needs Review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {appointment.insuranceStatus}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleAppointmentModal
          onClose={() => setShowScheduleModal(false)}
          patientName={user?.name}
        />
      )}
    </div>
  )
}

function ScheduleAppointmentModal({ onClose, patientName }) {
  const [formData, setFormData] = useState({
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    clinic: '',
    reason: '',
    notes: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Combine date and time into ISO string
      const scheduledTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`)
      
      const appointmentData = {
        scheduled_time: scheduledTime.toISOString(),
        provider: formData.clinic || formData.reason || 'General'
      }

      const response = await fetch(`${API_BASE_URL}/patient/portal/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        alert('Appointment request submitted successfully!')
        // Reload appointments
        try {
          await loadPatientAppointments()
        } catch (err) {
          console.error('Failed to reload appointments:', err)
        }
        onClose()
      } else {
        const error = await response.text()
        alert(`Failed to schedule appointment: ${error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-healthcare-blue to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Schedule Appointment</h2>
          <p className="text-blue-100 text-sm mt-1">Request a new appointment with our clinic</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Name Display */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Patient</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{patientName}</p>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Appointment Type
            </label>
            <select
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            >
              <option value="">Select type</option>
              <option value="General Checkup">General Checkup</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Specialist Consultation">Specialist Consultation</option>
              <option value="Lab Work">Lab Work</option>
              <option value="Vaccination">Vaccination</option>
            </select>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Time
            </label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            />
          </div>

          {/* Clinic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Clinic
            </label>
            <select
              name="clinic"
              value={formData.clinic}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            >
              <option value="">Select clinic</option>
              <option value="Main Clinic">Main Clinic</option>
              <option value="Downtown Center">Downtown Center</option>
              <option value="Riverside Medical">Riverside Medical</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason for Visit
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Brief reason for appointment"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-healthcare-blue to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientDashboard
