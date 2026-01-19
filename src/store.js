import { create } from 'zustand'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

const toBackendTimestamp = (date) => date.toISOString().replace('Z', '+00:00')

const normalizeVerificationStatus = (status) => {
  if (!status) return 'Needs Review'
  const normalized = status.toString().toLowerCase()
  if (normalized === 'verified') return 'Verified'
  if (normalized === 'needs_review') return 'Needs Review'
  if (normalized === 'expired') return 'Expired'
  return status
}

const normalizeAppointmentStatus = (scheduledTime) => {
  const dateValue = new Date(scheduledTime)
  if (Number.isNaN(dateValue.getTime())) return 'Upcoming'
  return dateValue < new Date() ? 'Completed' : 'Upcoming'
}

const normalizeDateTime = (value) => {
  if (!value) return value
  if (typeof value !== 'string') return value
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value)
  return hasTimezone ? value : `${value}Z`
}

const getStoredAuth = () => {
  const token = localStorage.getItem('authToken')
  const role = localStorage.getItem('authRole')
  const userRaw = localStorage.getItem('authUser')
  return {
    token,
    role,
    user: userRaw ? JSON.parse(userRaw) : null
  }
}

const setStoredAuth = ({ token, role, user }) => {
  if (token) {
    localStorage.setItem('authToken', token)
  }
  if (role) {
    localStorage.setItem('authRole', role)
  }
  if (user) {
    localStorage.setItem('authUser', JSON.stringify(user))
  }
}

const clearStoredAuth = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authRole')
  localStorage.removeItem('authUser')
}

const authHeader = () => {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }
  if (response.status === 204) return null
  return response.json()
}

export const useAuthStore = create((set) => {
  const stored = getStoredAuth()
  return {
    user: stored.user,
    role: stored.role,
    token: stored.token,
    isAuthenticated: Boolean(stored.token),
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null })
      try {
        const tokenPayload = await fetchJson(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        const token = tokenPayload.access_token
        const profile = await fetchJson(`${API_BASE_URL}/auth/me`, {
          headers: { ...authHeader(), Authorization: `Bearer ${token}` }
        })
        const user = {
          id: profile.id,
          email: profile.email,
          name: profile.email.split('@')[0],
          role: profile.role,
          clinicId: profile.clinic_id
        }
        setStoredAuth({ token, role: profile.role, user })
        set({ user, role: profile.role, token, isAuthenticated: true, isLoading: false, error: null })
      } catch (err) {
        set({ error: err.message || 'Invalid email or password', isLoading: false })
        throw err
      }
    },

    signup: async (clinicName, userName, email, password, role) => {
      set({ isLoading: true, error: null })
      const normalizedRole = role === 'admin' ? 'admin' : 'staff'
      try {
        const tokenPayload = await fetchJson(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify({
            clinic_name: clinicName,
            full_name: userName,
            email,
            password,
            role: normalizedRole
          })
        })
        const token = tokenPayload.access_token
        const profile = await fetchJson(`${API_BASE_URL}/auth/me`, {
          headers: { ...authHeader(), Authorization: `Bearer ${token}` }
        })
        const user = {
          id: profile.id,
          email: profile.email,
          name: userName || profile.email.split('@')[0],
          role: profile.role,
          clinicId: profile.clinic_id
        }
        setStoredAuth({ token, role: profile.role, user })
        set({ user, role: profile.role, token, isAuthenticated: true, isLoading: false, error: null })
      } catch (err) {
        set({ error: err.message || 'Signup failed', isLoading: false })
        throw err
      }
    },

    logout: () => {
      clearStoredAuth()
      set({ user: null, role: null, token: null, isAuthenticated: false })
    },

    patientLogin: async (email, password) => {
      set({ isLoading: true, error: null })
      try {
        const tokenPayload = await fetchJson(`${API_BASE_URL}/patient/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        const token = tokenPayload.access_token
        const profile = await fetchJson(`${API_BASE_URL}/patient/auth/me`, {
          headers: { ...authHeader(), Authorization: `Bearer ${token}` }
        })
        const user = {
          id: profile.id,
          email: profile.email,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          role: 'patient'
        }
        setStoredAuth({ token, role: 'patient', user })
        set({ user, role: 'patient', token, isAuthenticated: true, isLoading: false, error: null })
      } catch (err) {
        set({ error: err.message || 'Invalid email or password', isLoading: false })
        throw err
      }
    },

    patientSignup: async (firstName, lastName, email, password, dateOfBirth, phone) => {
      set({ isLoading: true, error: null })
      try {
        await fetchJson(`${API_BASE_URL}/patient/auth/register`, {
          method: 'POST',
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            phone: phone || null,
            dob: dateOfBirth || null
          })
        })
        set({ isLoading: false, error: null })
      } catch (err) {
        set({ error: err.message || 'Registration failed', isLoading: false })
        throw err
      }
    }
  }
})

export const useAppStore = create((set, get) => ({
  appointments: [],
  alerts: [],
  patients: [],
  theme: localStorage.getItem('theme') || 'light',
  appointmentsLoading: false,
  appointmentsError: null,
  patientsLoading: false,
  patientsError: null,

  loadAppointments: async (hoursAhead = 720) => {
    set({ appointmentsLoading: true, appointmentsError: null })
    try {
      const now = new Date()
      const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
      const params = new URLSearchParams({
        from_time: toBackendTimestamp(now),
        to_time: toBackendTimestamp(endTime)
      })
      const data = await fetchJson(`${API_BASE_URL}/appointments/?${params.toString()}`, {
        headers: { ...authHeader() }
      })
      const appointments = (data?.appointments || []).map((appointment) => {
        const insuranceStatus = normalizeVerificationStatus(
          appointment.insurance?.status || appointment.verification_status
        )
        const scheduledTime = normalizeDateTime(appointment.scheduled_time)
        return {
          id: appointment.id,
          patientName: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
          patientId: appointment.patient?.id?.toString() || '',
          dateTime: scheduledTime,
          provider: null,
          insurance: appointment.insurance?.provider || appointment.provider || '—',
          insuranceStatus,
          appointmentStatus: normalizeAppointmentStatus(scheduledTime),
          copay: appointment.copay ?? appointment.insurance?.copay ?? null,
          location: null,
          clinic: null,
          type: null,
          lastVerified: appointment.insurance?.last_checked || null,
          notes: ''
        }
      })
      set({ appointments, appointmentsLoading: false })
    } catch (err) {
      set({ appointmentsError: err.message || 'Failed to load appointments', appointmentsLoading: false })
    }
  },

  loadPatientAppointments: async () => {
    set({ appointmentsLoading: true, appointmentsError: null })
    try {
      const data = await fetchJson(`${API_BASE_URL}/patient/portal/appointments`, {
        headers: { ...authHeader() }
      })
      const appointments = (data?.appointments || []).map((appointment) => {
        const insuranceStatus = normalizeVerificationStatus(
          appointment.insurance?.status || appointment.verification_status
        )
        const scheduledTime = normalizeDateTime(appointment.scheduled_time)
        return {
          id: appointment.id,
          patientName: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
          patientId: appointment.patient?.id?.toString() || '',
          dateTime: scheduledTime,
          provider: null,
          insurance: appointment.insurance?.provider || appointment.provider || '—',
          insuranceStatus,
          appointmentStatus: normalizeAppointmentStatus(scheduledTime),
          copay: appointment.copay ?? appointment.insurance?.copay ?? null,
          location: null,
          clinic: null,
          type: null,
          lastVerified: appointment.insurance?.last_checked || null,
          notes: ''
        }
      })
      set({ appointments, appointmentsLoading: false })
    } catch (err) {
      set({ appointmentsError: err.message || 'Failed to load appointments', appointmentsLoading: false })
    }
  },

  loadPatients: async () => {
    set({ patientsLoading: true, patientsError: null })
    try {
      const data = await fetchJson(`${API_BASE_URL}/patients`, {
        headers: { ...authHeader() }
      })
      const patients = (data || []).map((patient) => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dob: patient.dob,
        createdAt: patient.created_at,
        appointmentCount: patient.appointment_count
      }))
      set({ patients, patientsLoading: false })
    } catch (err) {
      set({ patientsError: err.message || 'Failed to load patients', patientsLoading: false })
    }
  },

  fetchPatientDetail: async (patientId) => {
    if (!patientId) return null
    return fetchJson(`${API_BASE_URL}/patients/${patientId}`, {
      headers: { ...authHeader() }
    })
  },
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: newTheme }
    })
  },
  
  addAlert: (alert) => {
    const id = `alert-${Date.now()}`
    const newAlert = {
      id,
      ...alert,
      timestamp: new Date(),
      resolved: false
    }
    set((state) => ({
      alerts: [newAlert, ...state.alerts]
    }))
    return id
  },
  
  removeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter(a => a.id !== alertId)
    }))
  },
  
  resolveAlert: async (alertId) => {
    try {
      await fetchJson(`${API_BASE_URL}/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { ...authHeader() },
        body: JSON.stringify({ resolved: true })
      })
      // Update local state
      set(state => ({
        alerts: state.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a)
      }))
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  },
  
  updateAppointmentStatus: (appointmentId, status) => {
    set((state) => ({
      appointments: state.appointments.map(apt =>
        apt.id === appointmentId
          ? {
              ...apt,
              insuranceStatus: status,
              copay: status === 'Verified' ? apt.copay || Math.floor(Math.random() * 100) + 20 : null,
              lastVerified: new Date()
            }
          : apt
      )
    }))
    
    const apt = get().appointments.find(a => a.id === appointmentId)
    if (apt && status !== 'Verified') {
      get().addAlert({
        type: 'insurance_' + status.toLowerCase().replace(' ', '_'),
        severity: status === 'Expired' ? 'critical' : 'warning',
        title: `Insurance ${status}`,
        message: `${apt.patientName}'s insurance needs attention`,
        appointmentId,
        patientId: apt.patientId
      })
    }
  },
  
  loadAlerts: async () => {
    try {
      const data = await fetchJson(`${API_BASE_URL}/alerts`, {
        headers: { ...authHeader() }
      })
      const alerts = (data || []).map((alert) => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        appointmentId: alert.appointment_id,
        patientId: alert.patient_id,
        timestamp: new Date(alert.created_at),
        resolved: alert.resolved
      }))
      set({ alerts })
    } catch (err) {
      console.error('Failed to load alerts:', err)
    }
  },
  
  getAppointmentsInRange: (hoursFromNow = 48) => {
    const now = new Date()
    const endTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
    
    return get().appointments.filter(apt => {
      const appointmentDate = new Date(apt.dateTime)
      return appointmentDate >= now && appointmentDate <= endTime
    })
  }
}))
