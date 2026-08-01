import { useState } from 'react';
import {
  CheckCircle2,
  Globe2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { getApiUrl } from '@/api/client';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/api-error';

function roleLabel(role: 'COORDENADORA' | 'MENTOR'): string {
  return role === 'COORDENADORA' ? 'Coordenadora' : 'Mentor';
}

export function HomePage(): JSX.Element {
  const { user, reloadUser, logout, logoutAll } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<
    { variant: 'success' | 'error'; message: string } | null
  >(null);

  if (!user) {
    return <></>;
  }

  async function handleRefreshUser(): Promise<void> {
    setIsRefreshing(true);
    setFeedback(null);

    try {
      await reloadUser();
      setFeedback({
        variant: 'success',
        message: 'Dados do usuário atualizados pela rota GET /auth/eu.',
      });
    } catch (error) {
      setFeedback({ variant: 'error', message: getErrorMessage(error) });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogoutAll(): Promise<void> {
    setIsLoggingOutAll(true);

    try {
      await logoutAll();
    } finally {
      setIsLoggingOutAll(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-semibold gm-text-primary">Etapa 1 concluída</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Olá, {user.nome.split(' ')[0]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              A base do frontend, o cliente HTTP e o fluxo de autenticação já estão conectados aos contratos do backend.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void handleRefreshUser()} isLoading={isRefreshing}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Atualizar perfil
          </Button>
        </div>
      </section>

      {feedback ? <Alert variant={feedback.variant}>{feedback.message}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="gm-panel p-5">
          <div className="flex items-start justify-between">
            <div className="gm-metric-icon gm-metric-icon-blue">
              <UserRound aria-hidden="true" className="h-5 w-5" />
            </div>
            <span className="gm-status-success">Autenticado</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Usuário</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">{user.nome}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
        </article>

        <article className="gm-panel p-5">
          <div className="gm-metric-icon gm-metric-icon-blue">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Papel de acesso</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{roleLabel(user.papel)}</p>
          <p className="mt-1 text-sm text-slate-500">Proteção visual e por rota habilitada.</p>
        </article>

        <article className="gm-panel p-5">
          <div className="gm-metric-icon gm-metric-icon-blue">
            <Globe2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">API configurada</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">{getApiUrl()}</p>
          <p className="mt-1 text-sm text-slate-500">Cookies enviados com credentials: include.</p>
        </article>
      </section>

      <section className="gm-panel overflow-hidden">
        <div className="border-b gm-border px-6 py-5">
          <h3 className="text-lg font-bold text-slate-950">Fluxos disponíveis nesta etapa</h3>
          <p className="mt-1 text-sm text-slate-500">Operações reais da API de autenticação.</p>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b gm-border p-6 md:border-b-0 md:border-r">
            <div className="flex items-start gap-3">
              <div className="gm-metric-icon gm-metric-icon-green">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-950">Sessão atual</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Revoga a sessão vinculada ao refresh cookie e retorna ao login.
                </p>
              </div>
            </div>
            <Button className="mt-5" variant="secondary" onClick={() => void logout()}>
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Encerrar sessão
            </Button>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="gm-metric-icon gm-metric-icon-red">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-950">Todas as sessões</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Invalida todos os access tokens anteriores e revoga todas as sessões do usuário.
                </p>
              </div>
            </div>
            <Button className="mt-5" variant="danger" onClick={() => setConfirmOpen(true)}>
              Encerrar todas as sessões
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Encerrar todas as sessões?"
        description="Você será desconectado neste dispositivo e em todos os demais acessos vinculados à sua conta."
        confirmLabel="Encerrar todas"
        isLoading={isLoggingOutAll}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleLogoutAll()}
      />
    </div>
  );
}
