import { AppProviders } from './AppProviders'
import { useAppContext } from './appContext'
import { AuthProvider } from '../auth/AuthProvider'
import { LoginPage } from '../auth/LoginPage'
import { useAuth } from '../auth/authContext'
import { AppShell } from '../layout/AppShell'
import { ConfiguracoesPage } from '../modules/configuracoes/ConfiguracoesPage'
import { DashboardPage } from '../modules/dashboard/DashboardPage'
import { ExecucaoPage } from '../modules/execucao/ExecucaoPage'
import { InstrumentosPage } from '../modules/instrumentos/InstrumentosPage'
import { PlanoTrabalhoPage } from '../modules/plano-trabalho/PlanoTrabalhoPage'
import { PrestacaoContasPage } from '../modules/prestacao-contas/PrestacaoContasPage'

function CurrentPage() {
  const { route } = useAppContext()

  if (route.module === 'dashboard') return <DashboardPage />
  if (route.module === 'instrumentos') return <InstrumentosPage />
  if (route.module === 'plano') return <PlanoTrabalhoPage />
  if (route.module === 'execucao') return <ExecucaoPage />
  if (route.module === 'prestacao') return <PrestacaoContasPage />
  return <ConfiguracoesPage />
}

export function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <LoginPage />

  return (
    <AppProviders>
      <AppShell>
        <CurrentPage />
      </AppShell>
    </AppProviders>
  )
}
