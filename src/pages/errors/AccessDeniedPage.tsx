import { ArrowLeft, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccessDeniedPage(): JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <ShieldX aria-hidden="true" className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold text-red-700">Acesso negado</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Seu papel não permite abrir esta página.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          A interface bloqueou a navegação, mas o backend continua sendo a autoridade definitiva sobre a permissão.
        </p>
        <Link to="/" className="gm-link mt-6 inline-flex items-center gap-2">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
