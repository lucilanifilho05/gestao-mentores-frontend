import { LoaderCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = 'Carregando sua sessão...',
}: LoadingScreenProps): JSX.Element {
  return (
    <main className="gm-app-background flex min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="gm-brand-icon h-14 w-14">
          <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">Gestão de Mentores</p>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </main>
  );
}
