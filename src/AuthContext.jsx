import { createContext, useContext, useState, useEffect } from 'react'
import api from './api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [otpPending, setOtpPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })

      if (response.data.otpRequired) {
        setOtpPending(true)
        setPendingEmail(email)
        // Set temporary user object with email for OTP page
        setUser({ email: email })
        return { otpRequired: true }
      }

      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const verifyOtp = async (code) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email: pendingEmail,
        code
      })

      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setOtpPending(false)
      setPendingEmail(null)
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data || 'Invalid OTP')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setOtpPending(false)
    setPendingEmail(null)
  }

  return (
    <Ctx.Provider value={{ user, otpPending, login, verifyOtp, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
