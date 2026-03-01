import { createContext, useContext, useEffect, useState } from "react"

import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = Boolean(token)

  async function login(email, password) {
    try {
      const res = await api.post("/auth/login", { email, password })
      const accessToken = res?.data?.access_token
      if (!accessToken) throw new Error("Missing access token")

      localStorage.setItem("token", accessToken)
      localStorage.setItem("user_email", email)

      setToken(accessToken)
      setUser({ email })

      return true
    } catch (err) {
      throw err
    }
  }

  async function register(name, email, password) {
    await api.post("/auth/register", { name, email, password })
    return await login(email, password)
  }

  function logout() {
    localStorage.clear()
    setUser(null)
    setToken(null)
    window.location.href = "/"
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedEmail = localStorage.getItem("user_email")

    if (storedToken) {
      setToken(storedToken)
      setUser(storedEmail ? { email: storedEmail } : null)
    }

    setIsLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

