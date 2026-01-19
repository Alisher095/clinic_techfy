import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore, API_BASE_URL } from '../store'
import { formatAppointmentTime } from '../utils'
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Shield, RefreshCw, Calendar, Phone, Mail, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fetchPatientDetail = useAppStore(state => state.fetchPatientDetail)
  const appointment = useAppStore(state =>
    state.appointments.find(a => String(a.id) === String(id))
  )
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(appointment?.insuranceStatus)
  const [lastVerified, setLastVerified] = useState(appointment?.lastVerified)
  const [patientDetail, setPatientDetail] = useState(null)
  
  const handleReVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch(`${API_BASE_URL}/insurance/${id}/reverify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data.status)
        setLastVerified(new Date())
        // Update the appointment in the store
        useAppStore.getState().updateAppointmentStatus(id, data.status)
      } else {
        alert('Failed to re-verify insurance')
      }
    } catch (error) {
      alert('Error during re-verification')
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (!appointment?.patientId) return
    setVerificationStatus(appointment?.insuranceStatus)
    setLastVerified(appointment?.lastVerified)
    fetchPatientDetail(appointment.patientId)
      .then((detail) => setPatientDetail(detail))
      .catch(() => setPatientDetail(null))
  }, [appointment?.patientId, fetchPatientDetail])
  
  if (!appointment) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-healthcare-blue hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="card p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">Appointment not found</p>
        </div>
      </div>
    )
  }

  const patientData = {
    fullName: appointment.patientName || '—',
    email: 'Not available',
    phone: 'Not available',
    dateOfBirth: patientDetail?.dob ? new Date(patientDetail.dob).toLocaleDateString() : 'Not available',
    patientId: appointment.patientId
  }

  const latestInsurance = useMemo(() => {
    if (!patientDetail?.insurance_records?.length) return null
    return [...patientDetail.insurance_records].sort((a, b) => {
      const aTime = a.last_checked ? new Date(a.last_checked).getTime() : 0
      const bTime = b.last_checked ? new Date(b.last_checked).getTime() : 0
      return bTime - aTime
    })[0]
  }, [patientDetail])

  const insuranceData = {
    provider: latestInsurance?.provider || appointment.insurance || '—',
    policyId: latestInsurance?.policy_id || '—',
    eligibilityStatus: verificationStatus || appointment.insuranceStatus || 'Needs Review',
    coverageStartDate: latestInsurance?.last_checked ? new Date(latestInsurance.last_checked).toLocaleDateString() : '—',
    coverageEndDate: '—',
    copay: appointment.copay ?? latestInsurance?.copay ?? '—',
    deductible: '—',
    deductibleMet: '—',
    lastChecked: lastVerified || appointment.lastVerified || latestInsurance?.last_checked
  }

  const displayVerificationStatus = verificationStatus || appointment?.insuranceStatus || 'Needs Review'

  // Determine appointment readiness
  const canProceed = displayVerificationStatus === 'Verified'
  
  return (
    <div className="p-4 md:p-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-healthcare-blue hover:text-blue-700 mb-8"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      
      <div className="space-y-8">
        {/* 1️⃣ Appointment Overview Section */}
        <div className="card p-8 border-t-4 border-healthcare-blue">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Appointment Overview
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Appointment ID: <span className="font-semibold text-slate-900 dark:text-slate-100">{appointment.id}</span>
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-white ${
              appointment.type === 'Checkup' ? 'bg-blue-500' :
              appointment.type === 'Follow-up' ? 'bg-purple-500' :
              appointment.type === 'Consultation' ? 'bg-green-500' :
              'bg-orange-500'
            }`}>
              {appointment.type}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Date & Time
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {formatAppointmentTime(appointment.dateTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Appointment Status</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  appointment.appointmentStatus === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                  appointment.appointmentStatus === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }`}>
                  {appointment.appointmentStatus}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Clinic / Department</p>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {appointment.clinic || '—'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{appointment.location || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Provider</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {appointment.provider || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* 2️⃣ Patient Information Section */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Heart size={24} className="text-healthcare-blue" /> Patient Information
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Full Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {patientData.fullName}
                    </p>
                  </div>
                  
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                      <Mail size={14} /> Email
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {patientData.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                      <Phone size={14} /> Phone Number
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {patientData.phone}
                    </p>
                  </div>
                  
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Date of Birth</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {patientData.dateOfBirth}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">Patient ID</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {patientData.patientId}
                </p>
              </div>
            </div>

            {/* 3️⃣ Insurance Information Panel */}
            <div className="card p-8 border-l-4 border-healthcare-blue">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Shield size={24} className="text-healthcare-blue" /> Insurance Information
              </h2>
              
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-healthcare-blue/10 to-blue-500/10 dark:from-healthcare-blue/20 dark:to-blue-500/20 rounded-lg border border-healthcare-blue/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Insurance Provider</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {insuranceData.provider}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold text-white text-sm ${
                      displayVerificationStatus === 'Verified' ? 'bg-green-500' :
                      displayVerificationStatus === 'Needs Review' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {displayVerificationStatus === 'Verified' ? '✓ Verified' :
                       displayVerificationStatus === 'Needs Review' ? '⚠ Needs Review' :
                       '✕ Expired'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Policy ID</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.policyId}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Copay Amount</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.copay === '—' || insuranceData.copay === null
                        ? '—'
                        : `$${insuranceData.copay}`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Coverage Start Date</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.coverageStartDate}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Coverage End Date</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.coverageEndDate}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Deductible</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.deductible === '—' || insuranceData.deductible === null
                        ? '—'
                        : `$${insuranceData.deductible}`}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Deductible Met</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {insuranceData.deductibleMet === '—' || insuranceData.deductibleMet === null || insuranceData.deductible === '—' || insuranceData.deductible === null
                        ? '—'
                        : `$${insuranceData.deductibleMet} (${Math.round((insuranceData.deductibleMet / insuranceData.deductible) * 100)}%)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4️⃣ Insurance Verification Actions */}
            <div className="card p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <RefreshCw size={24} className="text-healthcare-blue" /> Insurance Verification
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleReVerify}
                  disabled={isVerifying}
                  className={`w-full px-6 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    isVerifying
                      ? 'bg-slate-400 cursor-not-allowed'
                      : verificationStatus === 'Verified'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-healthcare-blue hover:bg-blue-700'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Verifying... (2 seconds)
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      {displayVerificationStatus === 'Verified' ? 'Re-verify Insurance' : 'Verify Insurance'}
                    </>
                  )}
                </button>
                
                <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Last Verified</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {insuranceData.lastChecked
                          ? new Date(insuranceData.lastChecked).toLocaleString()
                          : 'Never verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {displayVerificationStatus === 'Verified' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-900 dark:text-green-100">Insurance Verified</p>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Coverage is active and eligible. This patient is ready for their appointment.
                      </p>
                    </div>
                  </div>
                )}

                {displayVerificationStatus === 'Needs Review' && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-yellow-900 dark:text-yellow-100">Review Required</p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        Insurance information needs manual review. Please verify coverage before appointment.
                      </p>
                    </div>
                  </div>
                )}

                {displayVerificationStatus === 'Expired' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-red-900 dark:text-red-100">Coverage Expired</p>
                      <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                        Insurance coverage has expired. Contact patient to update insurance information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 5️⃣ Appointment Readiness Indicator */}
          <div>
            <div className={`card p-8 sticky top-8 border-2 ${
              canProceed
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
            }`}>
              <div className="flex items-center justify-center mb-4">
                {canProceed ? (
                  <div className="p-4 bg-green-500 rounded-full">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500 rounded-full">
                    <AlertCircle size={40} className="text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-slate-100">
                Appointment Readiness
              </h3>
              
              <div className={`text-center text-4xl font-black mb-6 ${
                canProceed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {canProceed ? 'READY' : 'HOLD'}
              </div>
              
              <div className={`p-4 rounded-lg ${
                canProceed
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-yellow-100 dark:bg-yellow-900'
              }`}>
                <p className={`text-sm font-bold ${
                  canProceed
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}>
                  Can this appointment proceed?
                </p>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  {verificationStatus === 'Verified' ? (
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Insurance Status</p>
                    <p className="text-slate-600 dark:text-slate-400">{verificationStatus}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Patient Info</p>
                    <p className="text-slate-600 dark:text-slate-400">Complete</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Provider Assigned</p>
                    <p className="text-slate-600 dark:text-slate-400">{appointment.provider}</p>
                  </div>
                </div>
              </div>
              
              <button className={`w-full mt-6 px-4 py-3 rounded-lg font-bold text-white transition-all ${
                canProceed
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
              disabled={!canProceed}>
                {canProceed ? 'Proceed with Appointment' : 'Resolve Issues First'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetail
