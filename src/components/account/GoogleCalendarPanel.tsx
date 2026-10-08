import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { googleCalendarApi } from '@/api/google-calendar.api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/api-error';

export function GoogleCalendarPanel(): JSX.Element {
  const { user } = useAuth();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [result] = useState(() => params.get('googleAgenda'));
  const queryKey = ['google-agenda', user?.id];
  const status = useQuery({
    queryKey,
    queryFn: googleCalendarApi.status,
    enabled: Boolean(user),
    staleTime: 30000,
    refetchInterval: (query) =>
      (query.state.data?.pendentes ?? 0) > 0 ? 15000 : false,
  });
  const authorize = useMutation({ mutationFn: googleCalendarApi.authorize, onSuccess: ({ url }) => { window.location.assign(url); } });
  const invalidate = () => client.invalidateQueries({ queryKey });
  const disconnect = useMutation({ mutationFn: googleCalendarApi.disconnect, onSuccess: invalidate });
  const retry = useMutation({ mutationFn: googleCalendarApi.retry, onSuccess: invalidate });
  useEffect(() => {
    if (!params.has('googleAgenda')) return;
    const next = new URLSearchParams(params);
    next.delete('googleAgenda');
    setParams(next, { replace: true });
  }, [params, setParams]);
  const error = status.error ?? authorize.error ?? disconnect.error ?? retry.error;
  const data = status.data;
  const busy = authorize.isPending || disconnect.isPending || retry.isPending;

  return <section className="gm-panel p-5 sm:p-6">
    <div className="flex items-center gap-3 border-b gm-border pb-4"><CalendarDays className="h-5 w-5 gm-text-primary" /><div><h3 className="font-bold">Google Agenda</h3><p className="text-sm text-slate-500">Veja em um calendário separado as novas tarefas que possuem início e prazo final.</p></div></div>
    <div className="mt-5 space-y-4">
      {result === 'conectado' ? <Alert variant="success">Google Agenda conectado. As próximas tarefas atribuídas a você serão enviadas automaticamente.</Alert> : null}
      {result === 'erro' ? <Alert variant="error">Não foi possível conectar. Tente novamente e autorize o acesso ao calendário. Para trocar de conta Google, desconecte a conta atual primeiro.</Alert> : null}
      {error ? <Alert variant="error" title="Não foi possível concluir">{getErrorMessage(error)}</Alert> : null}
      {status.isLoading ? <p className="text-sm text-slate-600">Consultando conexão…</p> : null}
      {data && !data.disponivel ? <p className="text-sm text-slate-600">A integração ainda não está disponível. Aguarde a configuração pelo administrador.</p> : null}
      {data?.disponivel ? <>
        <p className="text-sm text-slate-600">{data.conectado ? `Conta conectada: ${data.email}` : data.email ? `A conexão de ${data.email} precisa ser renovada.` : 'Conecte a conta Google em que deseja receber suas tarefas.'}</p>
        <p className="text-sm text-slate-500">O calendário “Gestão de Mentores” recebe as tarefas criadas após a conexão. Nesta versão, alterações posteriores nas tarefas não são enviadas ao Google. Os eventos aparecem como disponível na agenda.</p>
        {data.pendentes > 0 ? <p className="text-sm text-slate-600">{data.pendentes} evento(s) aguardando envio.</p> : null}
        {data.falhas > 0 ? <Alert variant="error">{data.falhas} evento(s) não foram enviados. {data.conectado ? 'Você pode tentar novamente.' : 'Reconecte a conta para retomar os envios.'}</Alert> : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => authorize.mutate()} isLoading={authorize.isPending} disabled={busy}>{data.conectado ? 'Renovar conexão' : data.email ? 'Reconectar Google Agenda' : 'Conectar Google Agenda'}</Button>
          {data.email ? <Button variant="secondary" onClick={() => disconnect.mutate()} isLoading={disconnect.isPending} disabled={busy}>Desconectar</Button> : null}
          {data.conectado && data.falhas > 0 ? <Button variant="secondary" onClick={() => retry.mutate()} isLoading={retry.isPending} disabled={busy}>Tentar envios novamente</Button> : null}
        </div>
        {data.email ? <p className="text-xs text-slate-500">Desconectar interrompe os próximos envios. O calendário e os eventos já criados permanecem no Google.</p> : null}
      </> : null}
    </div>
  </section>;
}
