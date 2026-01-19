import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Shield, User, Mail, Lock, Briefcase, AlertCircle, CheckCircle, Stethoscope, Building2, Award, FileText, Eye, EyeOff } from 'lucide-react'

function StaffSignup() {
  const [step, setStep] = useState(1)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('front-desk')
  const [clinic, setClinic] = useState('')
  const [department, setDepartment] = useState('general')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const signup = useAuthStore(state => state.signup)

  const departments = {
    'front-desk': ['Reception', 'Scheduling', 'Patient Services'],
    'billing': ['Billing', 'Insurance', 'Collections', 'Coding']
  }

  const validateStep1 = () => {
    if (!userName || !email || !clinic) {
      setError('Please fill in all fields on this step')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const validateStep2 = () => {
    if (!licenseNumber || !specialization || !yearsExperience) {
      setError('Please fill in all professional details')
      return false
    }
    if (yearsExperience < 0 || yearsExperience > 70) {
      setError('Please enter a valid number of years')
      return false
    }
    setError('')
    return true
  }

  const validateStep3 = () => {
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions')
      return false
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep3()) return

    try {
      const staffData = {
        clinic,
        userName,
        email,
        password,
        role,
        department,
        licenseNumber,
        specialization,
        yearsExperience
      }
      await signup(clinic, userName, email, password, role)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Failed to create account')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healthcare-blue to-blue-600 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Account Successfully Created!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Your professional staff account has been verified and registered. An administrator will review your credentials shortly. Redirecting to login...</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
              You will receive an email confirmation at <strong>{email}</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-blue to-blue-600 dark:from-slate-900 dark:to-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Panel - Info */}
        <div className="hidden md:flex flex-col justify-between p-8 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Shield size={32} />
              <h1 className="text-3xl font-bold">Professional Staff Portal</h1>
            </div>
            <p className="text-lg text-blue-100 mb-8">Join our team of healthcare professionals managing insurance verification and patient appointments with industry-leading tools</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Award size={24} className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Professional Credentials</h3>
                <p className="text-blue-100">Secure verification of licenses and qualifications</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Stethoscope size={24} className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Specialized Roles</h3>
                <p className="text-blue-100">Front Desk, Billing, and specialized departments</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Building2 size={24} className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Enterprise Features</h3>
                <p className="text-blue-100">Real-time analytics, reporting, and audit trails</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle size={24} className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">HIPAA Compliant</h3>
                <p className="text-blue-100">Enterprise-grade security and compliance standards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex flex-col justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-md mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Professional Registration</h2>
              <p className="text-blue-100">Step {step} of 3 - {step === 1 ? 'Basic Information' : step === 2 ? 'Professional Details' : 'Credentials'}</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    s === step ? 'bg-white' : s < step ? 'bg-green-400' : 'bg-blue-300'
                  }`}
                />
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3 border border-red-200 dark:border-red-800">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* STEP 1: Basic Information */}
                {step === 1 && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="userName"
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Dr. John Doe"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="professional@clinic.com"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                      </div>
                    </div>

                    {/* Clinic Name */}
                    <div>
                      <label htmlFor="clinic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Clinic/Organization Name *
                      </label>
                      <div className="relative">
                        <Briefcase size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="clinic"
                          type="text"
                          value={clinic}
                          onChange={(e) => setClinic(e.target.value)}
                          placeholder="City Medical Clinic"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                      </div>
                    </div>

                    {/* Staff Role */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Primary Role *
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value)
                          setDepartment('')
                        }}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                      >
                        <option value="">Select a role</option>
                        <option value="front-desk">Front Desk Staff</option>
                        <option value="billing">Billing Staff</option>
                      </select>
                    </div>
                  </>
                )}

                {/* STEP 2: Professional Details */}
                {step === 2 && (
                  <>
                    {/* Department */}
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Department *
                      </label>
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                      >
                        {departments[role]?.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* License Number */}
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        License/Credential Number *
                      </label>
                      <div className="relative">
                        <FileText size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="licenseNumber"
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder="e.g., LIC-1234567"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Specialization/Certification *
                      </label>
                      <input
                        id="specialization"
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g., Insurance Verification Specialist"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                      />
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label htmlFor="yearsExperience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Years of Experience *
                      </label>
                      <input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        max="70"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        placeholder="5"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                      />
                    </div>
                  </>
                )}

                {/* STEP 3: Security & Agreement */}
                {step === 3 && (
                  <>
                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use uppercase, lowercase, numbers, and symbols for security</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-healthcare-blue focus:ring-2 focus:ring-healthcare-blue"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          I agree to the <Link to="#" className="text-healthcare-blue hover:underline">Terms of Service</Link>, <Link to="#" className="text-healthcare-blue hover:underline">Privacy Policy</Link>, and confirm that all provided information is accurate and complete *
                        </span>
                      </label>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 flex gap-3">
                      <Shield size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">Your account is HIPAA compliant and encrypted. All data is securely stored and audit-logged.</p>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`${step === 1 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-healthcare-blue to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                    >
                      Complete Registration
                    </button>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-center text-slate-600 dark:text-slate-400 mb-3">Already registered?</p>
                <Link
                  to="/login"
                  className="block text-center text-healthcare-blue hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffSignup
