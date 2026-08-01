import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage(): JSX.Element {
  return (
    <main className="gm-app-background flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="gm-brand-icon mx-auto h-16 w-16">
          <SearchX aria-hidden="true" className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold gm-text-primary">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          O endereço informado não corresponde a uma página disponível.
        </p>
        <Link to="/" className="gm-link mt-6 inline-flex items-center gap-2">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
