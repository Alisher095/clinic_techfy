import React, { useEffect, useState } from 'react'
import { Loader, LogIn, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { API_BASE_URL, useAppStore } from '../store'

const EMPTY_FORM_STATE = {
  username: '',
  password: '',
  patientName: '',
  dob: '',
  policyId: ''
}

const PAYERS = [
  { id: 'bluecross', name: 'Blue Cross', logo: '🔵', status: 'online' },
  { id: 'aetna', name: 'Aetna', logo: '❤️', status: 'online' },
  { id: 'cigna', name: 'Cigna', logo: '🟢', status: 'online' },
  { id: 'unitedhealth', name: 'UnitedHealth', logo: '🟦', status: 'slow' },
  { id: 'humana', name: 'Humana', logo: '🟨', status: 'online' },
]

const toInputDate = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().split('T')[0]
}

const formatFriendlyDate = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatPatientName = (patient) => {
  if (!patient) return '—'
  const first = patient.firstName || ''
  const last = patient.lastName || ''
  const full = `${first} ${last}`.trim()
  return full || '—'
}

function PayerSimulator() {
  const [selectedPayer, setSelectedPayer] = useState(() => PAYERS[0]?.id ?? null)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [loginState, setLoginState] = useState('idle')
  const [verificationState, setVerificationState] = useState('idle')
  const [formData, setFormData] = useState(() => ({ ...EMPTY_FORM_STATE }))
  const [verificationResult, setVerificationResult] = useState(null)
  const portalStatus = 'online'
  const [verificationError, setVerificationError] = useState('')

  const { patients, patientsLoading, loadPatients } = useAppStore((state) => ({
    patients: state.patients,
    patientsLoading: state.patientsLoading,
    loadPatients: state.loadPatients
  }))

  useEffect(() => {
    loadPatients().catch(() => {})
  }, [loadPatients])

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)
  const currentPayer = PAYERS.find((payer) => payer.id === selectedPayer)

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id)
    setVerificationResult(null)
    setLoginState('idle')
    setFormData((prev) => ({
      ...prev,
      patientName: formatPatientName(patient),
      dob: patient.dob ? toInputDate(patient.dob) : prev.dob
    }))
  }

  const handlePayerChange = (payerId) => {
    setSelectedPayer(payerId)
    setVerificationResult(null)
    setLoginState('idle')
    setFormData((prev) => ({
      ...prev,
      username: '',
      password: ''
    }))
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginState('loading')
    
    setTimeout(() => {
      if (formData.username && formData.password) {
        setLoginState('success')
        setVerificationState('idle')
      } else {
        setLoginState('error')
        setTimeout(() => setLoginState('idle'), 2000)
      }
    }, 1500)
  }
  
  const titleCase = (value) => value?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerificationState('loading')
    setVerificationError('')

    try {
      if (!formData.patientName) {
        throw new Error('Patient name is required for verification')
      }
      const payload = {
        patient_name: formData.patientName,
        ...(formData.policyId && { policy_id: formData.policyId }),
        ...(formData.dob && { dob: new Date(formData.dob).toISOString() })
      }
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/insurance/payer/${selectedPayer}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Verification failed')
      }

      setVerificationResult({
        ...data,
        status: titleCase(data.status),
        verifiedAt: data.verified_at
      })
      setVerificationState('success')
      setTimeout(() => setVerificationState('idle'), 2000)
    } catch (error) {
      setVerificationState('error')
      setVerificationError(error.message || 'Verification failed')
      setTimeout(() => setVerificationState('idle'), 2000)
    }
  }
  
  return (
    <div className="p-4 md:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-xl p-8 border border-emerald-500/20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">Payer Verification Simulator</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Simulate insurance verification workflows across multiple payers</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Clinic Patients */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Clinic Patients</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a patient to prefill verification data.</p>
            </div>
            {patientsLoading && (
              <span className="text-xs font-semibold text-healthcare-blue dark:text-emerald-200">Refreshing…</span>
            )}
          </div>
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    selectedPatientId === patient.id
                      ? 'border-healthcare-blue/70 bg-healthcare-blue/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-healthcare-blue/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatPatientName(patient)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">DOB {formatFriendlyDate(patient.dob)}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-healthcare-blue dark:text-teal-200">
                      {patient.appointmentCount ?? 0} visits
                    </span>
                  </div>
                  {patient.createdAt && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Added {formatFriendlyDate(patient.createdAt)}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/50 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                {patientsLoading ? 'Loading patients…' : 'No patients in the clinic yet.'}
              </div>
            )}
          </div>
        </div>
        
        {/* Portal Interaction */}
        <div className="md:col-span-2">
          {selectedPayer ? (
            <div className="card p-8 h-full relative">
              <div className="space-y-6 mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Connected portal</p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {(currentPayer?.name || 'Payer')} Portal
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedPatient ? `Verifying for ${formatPatientName(selectedPatient)}` : 'Select a patient from the roster to continue.'}
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Payer
                    </label>
                    <select
                      value={selectedPayer}
                      onChange={(e) => handlePayerChange(e.target.value)}
                      className="input-field"
                    >
                      {PAYERS.map((payer) => (
                        <option key={payer.id} value={payer.id}>
                          {payer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Patient</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {selectedPatient ? formatPatientName(selectedPatient) : 'No patient chosen'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      DOB {selectedPatient ? formatFriendlyDate(selectedPatient.dob) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {selectedPatient ? `Visits · ${selectedPatient.appointmentCount ?? 0}` : 'Choose a patient to begin'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${portalStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="text-xs uppercase tracking-wide text-slate-500">{portalStatus}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">
                      {selectedPatient
                        ? 'Login and verify insurance for this clinic member.'
                        : 'Select someone so the verification form can autofill.'}
                    </p>
                  </div>
                </div>
              </div>

              {!verificationResult ? (
                <div className="space-y-6">
                  {/* Login Section */}
                  {loginState === 'idle' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">Step 1: Portal Login</h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Enter portal username"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="input-field"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                        <LogIn size={20} />
                        Login to Portal
                      </button>
                    </form>
                  )}
                  
                  {loginState === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader className="animate-spin text-healthcare-blue mb-4" size={32} />
                      <p className="text-slate-600 dark:text-slate-400">Connecting to portal...</p>
                    </div>
                  )}
                  
                  {loginState === 'success' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        <p className="text-green-800 dark:text-green-200 font-medium">Logged in successfully</p>
                      </div>
                      
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">Step 2: Search Patient</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Patient Name
                        </label>
                        <input
                          type="text"
                          value={formData.patientName}
                          onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                          placeholder="John Smith"
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Policy ID
                        </label>
                        <input
                          type="text"
                          value={formData.policyId}
                          onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                          placeholder="POL123456789"
                          className="input-field"
                        />
                      </div>
                      
                      <button type="submit" className="btn btn-primary w-full">
                        Verify Insurance
                      </button>
                      {verificationState === 'error' && verificationError && (
                        <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-700">
                          <AlertCircle className="text-red-600 dark:text-red-400" size={16} />
                          <span>{verificationError}</span>
                        </div>
                      )}
                    </form>
                  )}
                  
                  {loginState === 'error' && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                      <p className="text-red-800 dark:text-red-200">Login failed. Please try again.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    <p className="text-green-800 dark:text-green-200 font-medium">Verification Successful</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 bg-slate-50 dark:bg-slate-800 p-4 rounded">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                        <span className="badge badge-success">{verificationResult.status}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Plan Type</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{verificationResult.planType}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Copay</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {verificationResult.copay ? `$${verificationResult.copay}` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Deductible</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">${verificationResult.deductible}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Verified At</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 text-xs">
                          {new Date(verificationResult.verifiedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {verificationResult.message && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      {verificationResult.message}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setVerificationResult(null)
                      setLoginState('idle')
                      setFormData((prev) => ({ ...prev, username: '', password: '' }))
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Start Over
                  </button>
                </div>
              )}
              
              {verificationState === 'loading' && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="animate-spin text-healthcare-blue mb-4 mx-auto" size={32} />
                    <p className="text-slate-600 dark:text-slate-400">Verifying insurance...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Select a payer to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PayerSimulator
