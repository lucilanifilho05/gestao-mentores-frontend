import { ArrowRight, ExternalLink, LayoutGrid, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import "./solutions.css";

interface SolutionCardProps {
  name: string;
  eyebrow: string;
  description: string;
  href: string;
  logo: string;
  accent: "blue" | "orange";
  external?: boolean;
}

function SolutionCard({ name, eyebrow, description, href, logo, accent, external = false }: SolutionCardProps): JSX.Element {
  const [logoFailed, setLogoFailed] = useState(false);
  const content = <>
    <div className="gm-solution-card-top"><span className={`gm-solution-index gm-solution-index-${accent}`}>{eyebrow}</span>{external ? <ExternalLink className="h-4 w-4 text-slate-400" aria-hidden="true" /> : null}</div>
    <div className={`gm-solution-logo-slot gm-solution-logo-${accent}`}>
      {logoFailed ? <span className="gm-solution-logo-fallback" aria-hidden="true">{name.slice(0, 1)}</span> : <img src={logo} alt={`Logo ${name}`} onError={() => setLogoFailed(true)} />}
    </div>
    <div className="gm-solution-content"><h2>{name}</h2><p>{description}</p></div>
    <span className="gm-solution-action">Acessar plataforma<span className={`gm-solution-action-icon gm-solution-action-icon-${accent}`}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span></span>
  </>;
  const className = `gm-solution-card gm-solution-card-${accent}`;
  return external
    ? <a className={className} href={href} aria-label={`Acessar ${name}`} target="_blank" rel="noreferrer">{content}</a>
    : <Link className={className} to={href} aria-label={`Acessar ${name}`}>{content}</Link>;
}

export function SolutionsHomePage(): JSX.Element {
  return <main className="gm-solutions-home">
    <header className="gm-solutions-header"><div className="gm-solutions-container gm-solutions-header-content">
      <div className="gm-solutions-brand"><div className="gm-brand-logo gm-brand-logo-surface"><img src="/images/logo.png" alt="SENAI Ceará" /></div><span className="gm-solutions-brand-divider" aria-hidden="true" /><div><p>SENAI Sobral</p><span>Hub de soluções digitais</span></div></div>
      <Link className="gm-solutions-login" to="/login">Acessar JUSANA <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div></header>
    <section className="gm-solutions-main gm-solutions-container">
      <div className="gm-solutions-hero">
        <div className="gm-solutions-hero-copy"><span className="gm-solutions-kicker"><LayoutGrid className="h-4 w-4" /> Ecossistema digital</span><h1>Tecnologia que conecta <span>pessoas e resultados.</span></h1><p>Encontre em um só lugar as plataformas desenvolvidas para apoiar a educação, a gestão e a inovação no SENAI Sobral.</p></div>
        <div className="gm-solutions-hero-mark" aria-hidden="true"><span>02</span><p>soluções disponíveis</p></div>
      </div>
      <div className="gm-solutions-section-heading"><div><span>PLATAFORMAS</span><h2>Escolha uma solução</h2></div><p>Acesso rápido aos ambientes digitais da unidade.</p></div>
      <div className="gm-solutions-grid">
        <SolutionCard name="JUSANA" eyebrow="Gestão de mentores" description="Organize atividades, acompanhe projetos e mantenha as entregas da equipe em um único ambiente." href="/login" logo="/images/solutions/jusana-logo.png" accent="blue" />
        <SolutionCard name="SAAR" eyebrow="Ambiente educacional" description="Acesse os recursos digitais da plataforma SAAR e simplifique a rotina do ambiente educacional." href="https://saar.jusana.space" logo="/images/solutions/saar-logo.png" accent="orange" external />
      </div>
      <div className="gm-solutions-trust"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><p>Ambiente oficial de soluções digitais do SENAI Sobral.</p></div>
    </section>
    <footer className="gm-solutions-footer"><div className="gm-solutions-container"><p>© {new Date().getFullYear()} SENAI Ceará — Unidade Sobral</p><p>Educação, inovação e desenvolvimento.</p></div></footer>
  </main>;
}
