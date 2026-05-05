import { useState, type ReactNode } from 'react'
import { instrumentoService } from '../services/instrumentoService'
import { initialRoute, type AppRoute } from './routes'
import { AppContext, type AppContextValue } from './appContext'

export function AppProviders({ children }: { children: ReactNode }) {
  const [instrumentosVersion, setInstrumentosVersion] = useState(0)
  const instrumentos = instrumentoService.listInstrumentos()
  const [route, setRoute] = useState<AppRoute>(initialRoute)
  const [selectedInstrumentoId, setSelectedInstrumentoId] = useState(
    instrumentos[0]?.id ?? '',
  )

  const selectedInstrumento = instrumentos.find(
    (instrumento) => instrumento.id === selectedInstrumentoId,
  )

  function refreshInstrumentos() {
    setInstrumentosVersion((current) => current + 1)
  }

  function selectInstrumento(id: string) {
    setSelectedInstrumentoId(id)
  }

  void instrumentosVersion

  const value: AppContextValue = {
    route,
    setRoute,
    selectedInstrumentoId,
    setSelectedInstrumentoId,
    selectInstrumento,
    refreshInstrumentos,
    selectedInstrumento,
    instrumentos,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
