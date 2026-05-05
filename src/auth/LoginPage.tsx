import { LockKey, SignIn } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { APP_FULL_NAME } from '../domains/constants'
import { useAuth } from './authContext'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@seap.rn.gov.br')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = login(email, password)

    if (!result.ok) {
      setError(result.message ?? 'Não foi possível entrar.')
      return
    }

    setError('')
  }

  return (
    <main className="grid min-h-dvh grid-cols-[0.95fr_1.05fr] bg-[var(--sigic-bg)]">
      <section className="relative overflow-hidden bg-[#17352f] px-12 py-10 text-white">
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_20%_20%,rgba(216,192,138,0.22),transparent_35%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
        <div className="relative flex min-h-full flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d8c08a]">Polícia Penal RN</p>
            <div className="mt-8 flex items-center gap-5">
              <img alt="Brasão da Polícia Penal RN" className="h-24 w-24 object-contain" src="/policia-penal-rn.png" />
              <div>
                <h1 className="text-5xl font-black leading-none tracking-tight">SIGIC</h1>
                <p className="mt-3 max-w-sm text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Gestão de instrumentos e convênios
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="text-2xl font-black tracking-tight">{APP_FULL_NAME}</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Ambiente local de demonstração para validação dos módulos, painel executivo e fluxos administrativos.
            </p>
          </div>
        </div>
      </section>

      <section className="grid place-items-center px-8">
        <form className="sigic-panel w-full max-w-md rounded-xl p-7" onSubmit={handleSubmit}>
          <div className="mb-6">
            <span className="inline-flex rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-[var(--sigic-green)]">
              <LockKey size={24} weight="bold" />
            </span>
            <p className="sigic-kicker mt-5">Acesso local</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Entrar no SIGIC</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--sigic-muted)]">
              Use as credenciais de demonstração para acessar o ambiente.
            </p>
          </div>

          <div className="grid gap-4">
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">{error}</p>}
            <Button className="w-full" icon={<SignIn size={18} weight="bold" />} type="submit">
              Entrar
            </Button>
          </div>

          <div className="mt-5 rounded-lg border border-[var(--sigic-border)] bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            Email: <strong>admin@seap.rn.gov.br</strong>
            <br />
            Senha: <strong>sigic123</strong>
          </div>
        </form>
      </section>
    </main>
  )
}
