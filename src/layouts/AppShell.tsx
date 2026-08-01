import { BookOpenCheck, Home, LogOut, UsersRound, GraduationCap } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

function roleLabel(role: 'COORDENADORA' | 'MENTOR'): string {
  return role === 'COORDENADORA' ? 'Coordenadora' : 'Mentor';
}

function getPageTitle(
  pathname: string,
): string {
  if (
    pathname.startsWith(
      '/usuarios',
    )
  ) {
    return 'Gestão de usuários';
  }

  if (
    pathname.startsWith(
      '/cursos',
    )
  ) {
    return 'Cursos';
  }

  return 'Visão geral da sessão';
}

export function AppShell(): JSX.Element {
  const { user, logout } = useAuth();

  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  const navItemClass = ({ isActive }: { isActive: boolean }): string =>
    `gm-nav-item ${isActive ? 'gm-nav-item-active' : ''}`;

  return (
    <div className="gm-app-background min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 gm-sidebar lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="gm-brand-icon-inverse h-11 w-11">
            <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">Gestão de Mentores</p>
            <p className="text-xs text-blue-100/70">Ambiente educacional</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Navegação principal">
          <NavLink to="/" end className={navItemClass}>
            <Home aria-hidden="true" className="h-5 w-5" />
            Início
          </NavLink>

          <NavLink
            to="/cursos"
            className={navItemClass}
          >
            <GraduationCap
              aria-hidden="true"
              className="h-5 w-5"
            />
            Cursos
          </NavLink>

          {user.papel === 'COORDENADORA' ? (
            <NavLink
              to="/usuarios"
              className={navItemClass}
            >
              <UsersRound
                aria-hidden="true"
                className="h-5 w-5"
              />
              Usuários
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="truncate text-sm font-semibold text-white">{user.nome}</p>
            <p className="mt-1 truncate text-xs text-blue-100/70">{user.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-50">
              {roleLabel(user.papel)}
            </span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b gm-border bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] gm-text-primary">
                Gestão de Mentores
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-950">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.nome}</p>
                <p className="text-xs text-slate-500">{roleLabel(user.papel)}</p>
              </div>
              <Button variant="ghost" onClick={() => void logout()}>
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
