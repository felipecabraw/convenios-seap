import { Bell, CaretDown, SignOut, UserCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { APP_FULL_NAME } from '../domains/constants'

const notifications = [
  'Prazo crítico em instrumento parlamentar',
  'Cláusula suspensiva vencida',
  'Prestação pendente de complementação',
]

export function Topbar() {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-[var(--sigic-border)] bg-white/95 px-6">
      <div>
        <p className="sigic-kicker">Ambiente inicial</p>
        <p className="text-sm font-semibold text-[var(--sigic-ink)]">{APP_FULL_NAME}</p>
      </div>
      <div className="relative flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          Dados locais
        </span>

        <div className="relative">
          <button
            className="relative rounded-md border border-[var(--sigic-border)] bg-white p-2 text-slate-600 transition hover:bg-slate-50"
            onClick={() => {
              setShowNotifications((current) => !current)
              setShowProfile(false)
            }}
            title="Notificações"
            type="button"
          >
            <Bell size={18} weight="bold" />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-700 px-1 text-[10px] font-black text-white">
              {notifications.length}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-lg border border-[var(--sigic-border)] bg-white p-3 shadow-[0_18px_44px_-30px_rgba(23,33,30,0.6)]">
              <p className="sigic-kicker mb-2">Notificações</p>
              <div className="grid gap-2">
                {notifications.map((notification) => (
                  <p className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700" key={notification}>
                    {notification}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-md border border-[var(--sigic-border)] bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setShowProfile((current) => !current)
              setShowNotifications(false)
            }}
            type="button"
          >
            <UserCircle size={20} weight="bold" />
            <span className="hidden xl:block">{user?.name ?? 'Usuário'}</span>
            <CaretDown size={14} weight="bold" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-72 rounded-lg border border-[var(--sigic-border)] bg-white p-3 shadow-[0_18px_44px_-30px_rgba(23,33,30,0.6)]">
              <p className="font-bold text-[var(--sigic-ink)]">{user?.name}</p>
              <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
              <p className="mt-2 rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">{user?.role}</p>
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 transition hover:bg-red-100"
                onClick={logout}
                type="button"
              >
                <SignOut size={16} weight="bold" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
