import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Mail, Lock, Loader, Activity, ChevronRight } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, isLoading, error: authError } = useAuthStore()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    }
  }
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-healthcare-blue to-blue-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        {/* Top - Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HealthCare</h1>
              <p className="text-teal-100 text-sm">Insurance Verification</p>
            </div>
          </div>
        </div>
        
        {/* Middle - Main Message */}
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-6 leading-tight">Streamline Insurance Verification</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">Manage clinic appointments and verify patient insurance in real-time with our advanced dashboard. Join 500+ healthcare providers.</p>
          
          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: '✓', text: '14-day free trial included' },
              { icon: '✓', text: 'No setup fees or hidden costs' },
              { icon: '✓', text: 'Dedicated onboarding support' },
              { icon: '✓', text: '24/7 customer support' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-teal-100">
                <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold">{item.icon}</span>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom - Trust indicator */}
        <div className="relative z-10 pt-8 border-t border-white/20">
          <p className="text-teal-100 text-sm">Start automating your insurance verification process today.</p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome Back</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Sign in to your clinic account</p>
          </div>
          
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error || authError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-healthcare-blue transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 text-base"
                  placeholder="name@clinic.com"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-healthcare-blue transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 text-base"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-8 flex items-center justify-center gap-2 text-lg py-3"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-slate-600 dark:text-slate-400 mb-4">
              Don't have a staff account?{' '}
              <Link to="/staff-signup" className="text-healthcare-blue font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4">
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-3">Are you a patient?</p>
            <Link
              to="/patient-login"
              className="block w-full text-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Patient Portal
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
              <strong>Demo Account</strong><br/>
              Email: demo@clinic.com<br/>
              Password: any password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
