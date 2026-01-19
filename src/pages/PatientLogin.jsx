import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react'

function PatientLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(state => state.patientLogin)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/patient-dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-blue to-blue-600 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart size={36} className="text-white" fill="white" />
            <h1 className="text-3xl font-bold text-white">HealthCare</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Patient Portal</h2>
          <p className="text-blue-100">Access your appointments and health information</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3 border border-red-200 dark:border-red-800">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-healthcare-blue"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-healthcare-blue to-blue-600 hover:from-blue-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Email: patient@example.com</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Password: password123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100 mb-2">Don't have an account?</p>
          <Link
            to="/patient-signup"
            className="text-white font-semibold hover:text-blue-200 transition-colors"
          >
            Create Patient Account
          </Link>
        </div>

        {/* Back to Staff Portal */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-blue-100 hover:text-white text-sm transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PatientLogin
