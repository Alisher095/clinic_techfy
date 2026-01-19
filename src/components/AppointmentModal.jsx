import React, { useState } from 'react'
import { useAppStore } from '../store'
import { formatAppointmentTime, formatTimeAgo, getStatusColor, generateMockVerificationResult } from '../utils'
import { X, Loader, RefreshCw, AlertCircle } from 'lucide-react'

function AppointmentModal({ appointment, onClose }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const updateAppointmentStatus = useAppStore(state => state.updateAppointmentStatus)
  
  const handleReVerify = async () => {
    setIsVerifying(true)
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = generateMockVerificationResult()
    updateAppointmentStatus(appointment.id, result.status)
    
    setIsVerifying(false)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">ID</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.patientId}</p>
              </div>
            </div>
          </div>
          
          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Date & Time</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{formatAppointmentTime(appointment.dateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Type</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Provider</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.provider}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.location}</p>
              </div>
            </div>
          </div>
          
          {/* Insurance Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Insurance Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Provider</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{appointment.insurance}</p>
                </div>
                <span className={`badge ${getStatusColor(appointment.insuranceStatus)}`}>
                  {appointment.insuranceStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Copay</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {appointment.copay ? `$${appointment.copay}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Verified</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{formatTimeAgo(appointment.lastVerified)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Warning */}
          {appointment.insuranceStatus !== 'Verified' && (
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">Action Required</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">Please re-verify this patient's insurance before the appointment.</p>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReVerify}
              disabled={isVerifying}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Re-verify Insurance
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentModal
