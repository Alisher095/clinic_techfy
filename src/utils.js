import { formatDistanceToNow, format } from 'date-fns'

export const formatAppointmentTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy • h:mm a')
}

export const formatTimeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'Verified':
      return 'badge-success'
    case 'Needs Review':
      return 'badge-warning'
    case 'Expired':
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

export const getStatusBgColor = (status) => {
  switch (status) {
    case 'Verified':
      return 'bg-green-500'
    case 'Needs Review':
      return 'bg-amber-500'
    case 'Expired':
      return 'bg-red-500'
    default:
      return 'bg-blue-500'
  }
}

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'badge-error'
    case 'warning':
      return 'badge-warning'
    case 'info':
      return 'badge-info'
    default:
      return 'badge-info'
  }
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const generateMockVerificationResult = () => {
  const statuses = ['Verified', 'Needs Review', 'Expired']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  return {
    status,
    copay: status === 'Verified' ? Math.floor(Math.random() * 100) + 20 : null,
    deductible: Math.floor(Math.random() * 2000) + 500,
    planType: ['HMO', 'PPO', 'EPO'][Math.floor(Math.random() * 3)],
    verifiedAt: new Date()
  }
}
