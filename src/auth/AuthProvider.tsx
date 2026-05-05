import { useState, type ReactNode } from 'react'
import { LOCAL_AUTH_KEY } from '../domains/constants'
import { AuthContext, type AuthUser } from './authContext'

const DEMO_EMAIL = 'admin@seap.rn.gov.br'
const DEMO_PASSWORD = 'sigic123'

const demoUser: AuthUser = {
  name: 'Administrador SEAP',
  email: DEMO_EMAIL,
  role: 'Gestão de convênios',
}

function readStoredUser() {
  const stored = localStorage.getItem(LOCAL_AUTH_KEY)
  if (!stored) return null

  return JSON.parse(stored) as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  function login(email: string, password: string) {
    if (!email.trim() || !password.trim()) {
      return { ok: false, message: 'Informe email e senha para entrar.' }
    }

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { ok: false, message: 'Credenciais inválidas para o ambiente local.' }
    }

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(LOCAL_AUTH_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(user), user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
