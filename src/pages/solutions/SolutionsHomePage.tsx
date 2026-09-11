import { ArrowRight, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import "./solutions.css";

interface SolutionCardProps {
  name: string;
  description: string;
  href: string;
  logo: string;
  accent: "blue" | "orange";
  external?: boolean;
}

function SolutionCard({ name, description, href, logo, accent, external = false }: SolutionCardProps): JSX.Element {
  const content = <>
    <div className={`gm-solution-logo-slot gm-solution-logo-${accent}`}>
      <span aria-hidden="true">{name.slice(0, 1)}</span>
      <img src={logo} alt={`Logo ${name}`} onError={(event) => { event.currentTarget.style.display = "none"; }} />
    </div>
    <div className="mt-6 flex items-start justify-between gap-4">
      <div><h2 className="text-2xl font-bold tracking-tight text-slate-950">{name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
      {external ? <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-slate-400" /> : null}
    </div>
    <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold gm-text-primary">Acessar solução <ArrowRight className="h-4 w-4" /></span>
  </>;
  const className = "gm-solution-card group block rounded-2xl border bg-white p-6 no-underline sm:p-7";
  return external
    ? <a className={className} href={href} aria-label={`Acessar ${name}`}>{content}</a>
    : <Link className={className} to={href} aria-label={`Acessar ${name}`}>{content}</Link>;
}

export function SolutionsHomePage(): JSX.Element {
  return <main className="gm-solutions-home flex min-h-screen flex-col">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-4"><div className="gm-brand-logo gm-brand-logo-surface"><img src="/images/logo.png" alt="SENAI Ceará" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-950">SENAI Sobral</p><p className="text-xs text-slate-500">Soluções digitais</p></div></div>
        <Link className="hidden items-center gap-2 text-sm font-bold gm-text-primary sm:inline-flex" to="/login">Acesso JUSANA <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </header>
    <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
      <div className="max-w-3xl"><span className="gm-solutions-kicker"><Sparkles className="h-4 w-4" />Tecnologia para transformar</span><h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Soluções digitais do <span className="gm-text-primary">SENAI Sobral</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Acesse as plataformas desenvolvidas para apoiar a gestão, integrar equipes e tornar os processos mais eficientes.</p></div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:gap-7">
        <SolutionCard name="JUSANA" description="Gestão e acompanhamento das atividades, projetos e entregas dos mentores." href="/login" logo="/images/solutions/jusana-logo.png" accent="blue" />
        <SolutionCard name="SAAR" description="Acesse a plataforma SAAR e seus recursos digitais para o ambiente educacional." href="https://saar.jusana.space" logo="/images/solutions/saar-logo.png" accent="orange" external />
      </div>
      <div className="mt-10 flex items-center gap-3 text-sm text-slate-500"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><p>Ambiente destinado às soluções oficiais do SENAI Sobral.</p></div>
    </section>
    <footer className="border-t border-slate-200/80"><div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-8"><p>© {new Date().getFullYear()} SENAI Ceará — Unidade Sobral</p><p>Educação, inovação e desenvolvimento.</p></div></footer>
  </main>;
}
