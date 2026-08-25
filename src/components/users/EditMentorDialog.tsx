import { useEffect, useState } from 'react';
import { KeyRound, Save, X } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useResetMentorPassword, useUpdateMentor } from '@/hooks/useUpdateUser';
import type { UsuarioListado } from '@/types/users.types';
import { getErrorMessage } from '@/utils/api-error';

interface Props { mentor: UsuarioListado | null; onClose: () => void; }

export function EditMentorDialog({ mentor, onClose }: Props): JSX.Element | null {
  const update = useUpdateMentor();
  const resetPassword = useResetMentorPassword();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { setNome(mentor?.nome ?? ''); setEmail(mentor?.email ?? ''); setSenha(''); setConfirmacao(''); setMessage(null); update.reset(); resetPassword.reset(); }, [mentor]);
  if (!mentor) return null;

  async function saveProfile(): Promise<void> {
    try { await update.mutateAsync({ usuarioId: mentor!.id, payload: { nome: nome.trim(), email: email.trim() } }); setMessage('Perfil do mentor atualizado.'); }
    catch { /* exibido abaixo */ }
  }
  async function savePassword(): Promise<void> {
    if (senha !== confirmacao) return;
    try { await resetPassword.mutateAsync({ usuarioId: mentor!.id, payload: { novaSenha: senha } }); setSenha(''); setConfirmacao(''); setMessage('Senha redefinida e sessões do mentor encerradas.'); }
    catch { /* exibido abaixo */ }
  }

  const pending = update.isPending || resetPassword.isPending;
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8" role="presentation"><div className="gm-panel w-full max-w-2xl overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="edit-mentor-title"><div className="flex items-start justify-between border-b gm-border px-6 py-5"><div><p className="gm-eyebrow">Gestão de usuários</p><h2 id="edit-mentor-title" className="mt-1 text-xl font-bold">Editar mentor</h2><p className="mt-1 text-sm text-slate-500">{mentor.nome}</p></div><button className="rounded-lg p-2 hover:bg-slate-100" disabled={pending} onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button></div><div className="space-y-6 p-6">
    {message ? <Alert variant="success">{message}</Alert> : null}
    {update.isError ? <Alert variant="error" title="Não foi possível atualizar">{getErrorMessage(update.error)}</Alert> : null}
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}><label><span className="mb-2 block text-sm font-semibold">Nome</span><input className="gm-input" required minLength={3} maxLength={150} value={nome} onChange={(event) => setNome(event.target.value)} /></label><label><span className="mb-2 block text-sm font-semibold">E-mail</span><input className="gm-input" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><div className="sm:col-span-2"><Button type="submit" isLoading={update.isPending} disabled={pending}><Save className="h-4 w-4" />Salvar dados</Button></div></form>
    <div className="border-t gm-border pt-5"><h3 className="font-bold">Redefinir senha</h3><p className="mt-1 text-sm text-slate-500">A senha atual nunca é exibida. A redefinição encerra todas as sessões do mentor.</p>{resetPassword.isError ? <div className="mt-4"><Alert variant="error">{getErrorMessage(resetPassword.error)}</Alert></div> : null}<form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void savePassword(); }}><label><span className="mb-2 block text-sm font-semibold">Nova senha</span><input className="gm-input" type="password" required minLength={8} maxLength={128} value={senha} onChange={(event) => setSenha(event.target.value)} /></label><label><span className="mb-2 block text-sm font-semibold">Confirmar senha</span><input className="gm-input" type="password" required minLength={8} maxLength={128} value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} /></label><div className="sm:col-span-2"><Button type="submit" variant="secondary" isLoading={resetPassword.isPending} disabled={pending || senha !== confirmacao}><KeyRound className="h-4 w-4" />Redefinir senha</Button></div></form></div>
  </div></div></div>;
}
