import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useAppStore, API_BASE_URL } from './store'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StaffSignup from './pages/StaffSignup'
import PatientLogin from './pages/PatientLogin'
import PatientSignup from './pages/PatientSignup'
import PatientDashboard from './pages/PatientDashboard'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import PatientDetail from './pages/PatientDetail'
import AppointmentDetail from './pages/AppointmentDetail'
import AlertsCenter from './pages/AlertsCenter'
import PayerSimulator from './pages/PayerSimulator'
import AIOrchestrator from './pages/AIOrchestrator'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const role = useAuthStore(state => state.role)
  const loadAppointments = useAppStore(state => state.loadAppointments)
  const loadPatientAppointments = useAppStore(state => state.loadPatientAppointments)
  const loadPatients = useAppStore(state => state.loadPatients)
  const theme = useAppStore(state => state.theme)

  const loadAlerts = useAppStore(state => state.loadAlerts)

  useEffect(() => {
    // Set initial theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [theme])

  useEffect(() => {
    if (!isAuthenticated) return

    if (role === 'patient') {
      loadPatientAppointments()
    } else {
      loadAppointments()
      loadPatients()
      loadAlerts()
      
      // Connect to WebSocket for real-time alerts
      const wsUrl = API_BASE_URL.replace('/api/v1', '').replace('http', 'ws') + '/ws/alerts'
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('Connected to alerts WebSocket')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'alert') {
          loadAlerts() // Reload alerts
        }
      }
      
      ws.onclose = () => {
        console.log('Disconnected from alerts WebSocket')
      }
      
      return () => {
        ws.close()
      }
    }
  }, [isAuthenticated, role, loadAppointments, loadPatientAppointments, loadPatients, loadAlerts])

  return (
    <Router>
      <Routes>
        {/* Staff Portal */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/staff-signup" element={<StaffSignup />} />

        {/* Patient Portal */}
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-signup" element={<PatientSignup />} />

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          {/* Patient Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />

          {/* Staff Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointment/:id" element={<AppointmentDetail />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
            <Route path="/alerts" element={<AlertsCenter />} />
            <Route path="/payer-simulator" element={<PayerSimulator />} />
            <Route path="/ai-orchestrator" element={<AIOrchestrator />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
