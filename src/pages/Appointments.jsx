import React, { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '../store'
import { formatAppointmentTime, getStatusColor } from '../utils'
import { Search, Filter, ChevronRight, Calendar, Clock, Building2, Plus, CheckCircle, AlertCircle, Eye, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

function Appointments() {
  const appointments = useAppStore(state => state.appointments)
  const loadAppointments = useAppStore(state => state.loadAppointments)
  const appointmentsLoading = useAppStore(state => state.appointmentsLoading)
  const appointmentsError = useAppStore(state => state.appointmentsError)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeRange, setTimeRange] = useState(720) // 30 days default
  const [sortBy, setSortBy] = useState('date')
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    dateTime: '',
    type: 'Checkup',
    clinic: 'Cardiology Clinic',
    location: 'Room 101'
  })

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Auto-refresh appointments every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAppointments()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [loadAppointments])

  const filteredAppointments = useMemo(() => {
    const now = new Date()
    const endTime = new Date(now.getTime() + timeRange * 60 * 60 * 1000)

    let filtered = appointments
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

    // Sort appointments
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    } else if (sortBy === 'patient') {
      filtered.sort((a, b) => a.patientName.localeCompare(b.patientName))
    } else if (sortBy === 'status') {
      const statusOrder = { 'Verified': 0, 'Needs Review': 1, 'Expired': 2 }
      filtered.sort((a, b) => statusOrder[a.insuranceStatus] - statusOrder[b.insuranceStatus])
    }

    return filtered
  }, [appointments, searchTerm, statusFilter, timeRange, sortBy])

  const stats = {
    total: filteredAppointments.length,
    verified: filteredAppointments.filter(a => a.insuranceStatus === 'Verified').length,
    needsReview: filteredAppointments.filter(a => a.insuranceStatus === 'Needs Review').length,
    expired: filteredAppointments.filter(a => a.insuranceStatus === 'Expired').length,
  }

  const getStatusIcon = (status) => {
    if (status === 'Verified') return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
    if (status === 'Needs Review') return <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
    return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
  }

  const getAppointmentStatusIcon = (status) => {
    if (status === 'Upcoming') return <Clock size={16} className="text-blue-600 dark:text-blue-400" />
    if (status === 'Completed') return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
    return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
  }

  const getAppointmentStatusColor = (status) => {
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    if (status === 'Completed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }

  const getStatusBadgeColor = (status) => {
    if (status === 'Verified') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    if (status === 'Needs Review') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-healthcare-blue/10 to-blue-500/10 dark:from-healthcare-blue/20 dark:to-blue-500/20 rounded-xl p-8 border border-healthcare-blue/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-healthcare-blue to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
              Appointments
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage and verify appointments with insurance information</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadAppointments()}
              className="flex md:hidden items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold flex-shrink-0">
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => loadAppointments()}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="flex md:hidden items-center justify-center gap-2 px-4 py-3 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex-shrink-0">
              <Plus size={20} />
              <span className="hidden sm:inline">New</span>
            </button>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              <Plus size={20} />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Appointments"
          value={stats.total}
          icon={Calendar}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={CheckCircle}
          color="from-green-500 to-green-600"
        />
        <StatCard
          label="Needs Review"
          value={stats.needsReview}
          icon={AlertCircle}
          color="from-yellow-500 to-yellow-600"
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={AlertCircle}
          color="from-red-500 to-red-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Search Patient
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Insurance Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="input-field w-full"
            >
              <option value={24}>Next 24 hours</option>
              <option value={72}>Next 3 days</option>
              <option value={168}>Next 7 days</option>
              <option value={336}>Next 14 days</option>
              <option value={720}>Next 30 days</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
          <div className="flex gap-2">
            {['date', 'patient', 'status'].map(option => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === option
                    ? 'bg-healthcare-blue text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Cards Grid */}
      <div className="space-y-4">
        {appointmentsLoading ? (
          <div className="card p-12 text-center">
            <Clock size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading appointments...</p>
          </div>
        ) : appointmentsError ? (
          <div className="card p-12 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">{appointmentsError}</p>
            <button
              onClick={() => loadAppointments()}
              className="mt-4 px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">No appointments found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map(apt => (
              <div key={apt.id} className="card p-6 border-l-4 border-healthcare-blue hover:shadow-lg transition-all">
                {/* Header with ID and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-healthcare-blue dark:text-blue-400 mb-1">APPOINTMENT ID</p>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{apt.id}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAppointmentStatusColor(apt.appointmentStatus)}`}>
                    {getAppointmentStatusIcon(apt.appointmentStatus)}
                  </span>
                </div>

                {/* Patient Info */}
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Patient</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{apt.patientName || '—'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{apt.patientId || '—'}</p>
                </div>

                {/* Date & Time */}
                <div className="mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-healthcare-blue flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Date & Time</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{formatAppointmentTime(apt.dateTime)}</p>
                  </div>
                </div>

                {/* Clinic & Location */}
                <div className="mb-4 flex items-start gap-2">
                  <Building2 size={16} className="text-healthcare-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Clinic / Department</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{apt.clinic || '—'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{apt.location || '—'}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Appointment Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAppointmentStatusColor(apt.appointmentStatus)}`}>
                      {getAppointmentStatusIcon(apt.appointmentStatus)}
                      {apt.appointmentStatus}
                    </span>
                  </div>
                </div>

                {/* Insurance Status */}
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Insurance Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(apt.insuranceStatus)}`}>
                    {getStatusIcon(apt.insuranceStatus)}
                    {apt.insuranceStatus}
                  </span>
                </div>

                {/* View Button */}
                <Link
                  to={`/appointment/${apt.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye size={16} />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          onClose={() => setShowNewAppointmentModal(false)}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  )
}

function NewAppointmentModal({ isOpen, onClose, formData, setFormData }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('New appointment:', formData)
    onClose()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-healthcare-blue to-blue-600 dark:from-healthcare-blue dark:to-blue-700 text-white p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">New Appointment</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Patient Details Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Patient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="patient@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="Checkup">Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Clinic / Department *
                  </label>
                  <select
                    name="clinic"
                    value={formData.clinic}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="Cardiology Clinic">Cardiology Clinic</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Surgery Department">Surgery Department</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Room / Location *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="Room 101">Room 101</option>
                    <option value="Room 202">Room 202</option>
                    <option value="Room 303">Room 303</option>
                    <option value="Operating Room A">Operating Room A</option>
                    <option value="Operating Room B">Operating Room B</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>)
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-6 border-l-4 border-healthcare-blue">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default Appointments
