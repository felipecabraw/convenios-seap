import { createContext, useContext } from 'react'
import type { Instrumento } from '../data/database.types'
import type { AppRoute } from './routes'

export interface AppContextValue {
  route: AppRoute
  setRoute: (route: AppRoute) => void
  selectedInstrumentoId: string
  setSelectedInstrumentoId: (id: string) => void
  selectInstrumento: (id: string) => void
  refreshInstrumentos: () => void
  selectedInstrumento: Instrumento | undefined
  instrumentos: Instrumento[]
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProviders')
  }

  return context
}
