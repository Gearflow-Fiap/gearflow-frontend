import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getRefreshToken } from '@/lib/auth'
import { useRevokeToken } from '@/api/hooks'
import { Button } from '@/components/ui'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/service-orders', label: 'Ordens de Serviço' },
  { to: '/clients', label: 'Clientes' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/inventory', label: 'Estoque' },
  { to: '/public-status', label: 'Consulta pública' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const revoke = useRevokeToken()

  const logout = async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await revoke.mutateAsync({ data: { refreshToken } })
      } catch {
        /* ignora — segue com logout local */
      }
    }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <div className="mb-6 flex items-center gap-2 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-600 font-bold text-white">G</span>
            <span className="font-semibold text-slate-800">GearFlow</span>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <span className="text-sm text-slate-400 md:hidden">GearFlow</span>
            <div className="ml-auto">
              <Button variant="secondary" onClick={logout} disabled={revoke.isPending}>
                Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
