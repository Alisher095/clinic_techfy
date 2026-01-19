import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to patient signup
    navigate('/patient-signup')
  }, [navigate])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}

export default Signup
