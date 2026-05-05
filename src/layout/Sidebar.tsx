import {
  ChartBar,
  ClipboardText,
  FileText,
  GearSix,
  Handshake,
  ListChecks,
} from '@phosphor-icons/react'
import { useAppContext } from '../app/appContext'
import type { ModuleKey } from '../app/routes'

const navItems: Array<{ key: ModuleKey; label: string; icon: typeof ChartBar }> = [
  { key: 'dashboard', label: 'Painel Gerencial', icon: ChartBar },
  { key: 'instrumentos', label: 'Instrumentos', icon: Handshake },
  { key: 'plano', label: 'Plano de Trabalho', icon: ListChecks },
  { key: 'execucao', label: 'Execução / Contratações', icon: ClipboardText },
  { key: 'prestacao', label: 'Prestação de Contas', icon: FileText },
  { key: 'configuracoes', label: 'Configurações / Domínios', icon: GearSix },
]

export function Sidebar() {
  const { route, setRoute } = useAppContext()

  return (
    <aside className="sigic-sidebar sticky top-0 flex h-dvh w-72 shrink-0 flex-col border-r border-[#0f2f29] bg-[#123a33] text-white shadow-[12px_0_40px_-32px_rgba(23,33,30,0.9)]">
      <div className="relative overflow-hidden border-b border-white/10 px-5 py-3 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d8c08a]/10 blur-2xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d8c08a]/60 to-transparent" />

        <div className="relative grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d8c08a]">SEAP/RN</p>
              <p className="mt-0.5 max-w-[150px] text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-slate-400">
                Administração Penitenciária
              </p>
            </div>
            <img
              alt="Polícia Penal RN"
              className="h-[66px] w-[66px] shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]"
              src="/policia-penal-rn.png"
            />
          </div>

          <div>
            <h1 className="whitespace-nowrap text-[21px] font-black leading-none tracking-tight text-white">
              SIGIC - Polícia Penal RN
            </h1>
            <div className="mt-2 h-1 w-12 rounded-full bg-[#d8c08a]" />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = route.module === item.key
          return (
            <button
              className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-[15px] font-semibold transition duration-200 active:translate-y-[1px] ${
                active
                  ? 'bg-[#f6f1e7] text-[#17352f] shadow-[0_12px_28px_-22px_rgba(0,0,0,0.8)]'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
              key={item.key}
              onClick={() => setRoute({ module: item.key })}
              type="button"
            >
              <Icon size={19} weight="bold" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs leading-relaxed text-slate-400">
        <span className="mb-2 block font-black uppercase tracking-[0.14em] text-[#d8c08a]">Ambiente local</span>
        Dados simulados hoje, integração Supabase preparada por repository.
      </div>
    </aside>
  )
}
