import {
  FolderKanban,
  Home,
  LogOut,
  UsersRound,
  GraduationCap,
  Layers3,
  ListTodo,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

function roleLabel(role: "COORDENADORA" | "MENTOR"): string {
  return role === "COORDENADORA" ? "Coordenadora" : "Mentor";
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/tipos-atividade")) {
    return "Tipos de atividade";
  }
  if (pathname.startsWith("/projetos")) return "Projetos";

  if (pathname.startsWith("/tarefas")) {
    return "Backlog de tarefas";
  }

  if (pathname.startsWith("/turmas")) {
    return "Turmas";
  }

  if (pathname.startsWith("/usuarios")) {
    return "Gestão de usuários";
  }

  if (pathname.startsWith("/cursos")) {
    return "Cursos";
  }

  return "Visão geral";
}

export function AppShell(): JSX.Element {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  const navItemClass = ({ isActive }: { isActive: boolean }): string =>
    `gm-nav-item ${isActive ? "gm-nav-item-active" : ""}`;

  return (
    <div className="gm-app-background min-h-screen">
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(88vw,19rem)] flex-col gm-sidebar shadow-2xl" aria-label="Menu principal">
            <div className="flex min-h-24 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3"><div className="gm-brand-logo gm-brand-logo-inverse"><img src="/images/logo.png" alt="SENAI Ceará" /></div><div className="min-w-0"><p className="truncate font-bold text-white">Gestão de Mentores</p><p className="text-xs text-blue-100/70">Ambiente educacional</p></div></div>
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navegação principal">
              <NavLink to="/" end className={navItemClass} onClick={() => setMobileOpen(false)}><Home className="h-5 w-5" />Início</NavLink>
              <NavLink to="/cursos" className={navItemClass} onClick={() => setMobileOpen(false)}><GraduationCap className="h-5 w-5" />Cursos</NavLink>
              <NavLink to="/turmas" className={navItemClass} onClick={() => setMobileOpen(false)}><Layers3 className="h-5 w-5" />Turmas</NavLink>
              <NavLink to="/tarefas" className={navItemClass} onClick={() => setMobileOpen(false)}><ListTodo className="h-5 w-5" />Tarefas</NavLink>
              <NavLink to="/projetos" className={navItemClass} onClick={() => setMobileOpen(false)}><FolderKanban className="h-5 w-5" />Projetos</NavLink>
              {user.papel === "COORDENADORA" ? <><NavLink to="/tipos-atividade" className={navItemClass} onClick={() => setMobileOpen(false)}><Tags className="h-5 w-5" />Tipos de atividade</NavLink><NavLink to="/usuarios" className={navItemClass} onClick={() => setMobileOpen(false)}><UsersRound className="h-5 w-5" />Usuários</NavLink></> : null}
            </nav>
            <div className="border-t border-white/10 p-4"><p className="truncate text-sm font-semibold text-white">{user.nome}</p><p className="mt-1 truncate text-xs text-blue-100/70">{user.email}</p></div>
          </aside>
        </div>
      ) : null}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 gm-sidebar lg:flex">
        <div className="flex min-h-24 items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="gm-brand-logo gm-brand-logo-inverse">
            <img src="/images/logo.png" alt="SENAI Ceará" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-white">
              Gestão de Mentores
            </p>
            <p className="text-xs text-blue-100/70">Ambiente educacional</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Navegação principal">
          <NavLink to="/" end className={navItemClass}>
            <Home aria-hidden="true" className="h-5 w-5" />
            Início
          </NavLink>

          <NavLink to="/cursos" className={navItemClass}>
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
            Cursos
          </NavLink>

          <NavLink to="/turmas" className={navItemClass}>
            <Layers3 aria-hidden="true" className="h-5 w-5" />
            Turmas
          </NavLink>

          <NavLink to="/tarefas" className={navItemClass}>
            <ListTodo aria-hidden="true" className="h-5 w-5" />
            Tarefas
          </NavLink>
          <NavLink to="/projetos" className={navItemClass}>
            <FolderKanban aria-hidden="true" className="h-5 w-5" />
            Projetos
          </NavLink>

          {user.papel === "COORDENADORA" ? (
            <NavLink to="/tipos-atividade" className={navItemClass}>
              <Tags aria-hidden="true" className="h-5 w-5" />
              Tipos de atividade
            </NavLink>
          ) : null}

          {user.papel === "COORDENADORA" ? (
            <NavLink to="/usuarios" className={navItemClass}>
              <UsersRound aria-hidden="true" className="h-5 w-5" />
              Usuários
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="truncate text-sm font-semibold text-white">
              {user.nome}
            </p>
            <p className="mt-1 truncate text-xs text-blue-100/70">
              {user.email}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-50">
              {roleLabel(user.papel)}
            </span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b gm-border bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border gm-border text-slate-700 lg:hidden" aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
              <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] gm-text-primary">
                Gestão de Mentores
              </p>
              <h1 className="mt-1 truncate text-lg font-bold text-slate-950 sm:text-xl">
                {getPageTitle(location.pathname)}
              </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.nome}
                </p>
                <p className="text-xs text-slate-500">
                  {roleLabel(user.papel)}
                </p>
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
