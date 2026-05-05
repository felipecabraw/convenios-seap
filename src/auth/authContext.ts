import { createContext, useContext } from 'react'

export interface AuthUser {
  name: string
  email: string
  role: string
}

export interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (email: string, password: string) => { ok: boolean; message?: string }
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}
