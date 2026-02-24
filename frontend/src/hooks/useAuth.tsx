import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import axios from "axios"

const API_BASE = "http://localhost:8000/api/auth"

export interface UserData {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  bio?: string | null
  avatarSeed?: string | null
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  refreshSession: () => Promise<void>
  setUser: (user: UserData | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshSession: async () => {},
  setUser: () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-session`, {
        withCredentials: true,
      })
      setUser(res.data?.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/sign-out`, {}, { withCredentials: true })
    } catch {}
    setUser(null)
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return (
    <AuthContext.Provider value={{ user, loading, refreshSession, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
