import { useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useChangeMyPassword, useUpdateMyProfile } from '@/hooks/useUpdateUser';
import { getErrorMessage } from '@/utils/api-error';

export function AccountPage(): JSX.Element {
  const { user, reloadUser, logout } = useAuth();
  const updateProfile = useUpdateMyProfile();
  const changePassword = useChangeMyPassword();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (!user) return <></>;

  async function saveProfile(): Promise<void> {
    setMessage(null);
    try {
      await updateProfile.mutateAsync({ nome: nome.trim(), email: email.trim() });
      await reloadUser();
      setMessage('Perfil atualizado com sucesso.');
    } catch { /* exibido no formulário */ }
  }

  async function savePassword(): Promise<void> {
    setMessage(null);
    if (novaSenha !== confirmacao) return;
    try {
      await changePassword.mutateAsync({ senhaAtual, novaSenha });
      await logout();
    } catch { /* exibido no formulário */ }
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <section><p className="gm-eyebrow">Conta e segurança</p><h2 className="mt-2 text-3xl font-bold text-slate-950">Minha conta</h2><p className="mt-2 text-sm text-slate-600">Atualize seus dados pessoais e sua senha de acesso.</p></section>
    {message ? <Alert variant="success" title="Alteração concluída">{message}</Alert> : null}
    <section className="gm-panel p-5 sm:p-6"><div className="flex items-center gap-3 border-b gm-border pb-4"><UserRound className="h-5 w-5 gm-text-primary" /><div><h3 className="font-bold">Dados do perfil</h3><p className="text-sm text-slate-500">Seu papel de acesso não pode ser alterado.</p></div></div>
      {updateProfile.isError ? <div className="mt-4"><Alert variant="error" title="Não foi possível atualizar">{getErrorMessage(updateProfile.error)}</Alert></div> : null}
      <form className="mt-5 grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}><label><span className="mb-2 block text-sm font-semibold">Nome completo</span><input className="gm-input" required minLength={3} maxLength={150} value={nome} onChange={(event) => setNome(event.target.value)} /></label><label><span className="mb-2 block text-sm font-semibold">E-mail</span><input className="gm-input" required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label><div className="sm:col-span-2"><Button type="submit" isLoading={updateProfile.isPending}><Save className="h-4 w-4" />Salvar perfil</Button></div></form>
    </section>
    <section className="gm-panel p-5 sm:p-6"><div className="flex items-center gap-3 border-b gm-border pb-4"><KeyRound className="h-5 w-5 gm-text-primary" /><div><h3 className="font-bold">Alterar senha</h3><p className="text-sm text-slate-500">Após a alteração, todas as suas sessões serão encerradas.</p></div></div>
      {changePassword.isError ? <div className="mt-4"><Alert variant="error" title="Não foi possível alterar a senha">{getErrorMessage(changePassword.error)}</Alert></div> : null}
      {confirmacao && novaSenha !== confirmacao ? <div className="mt-4"><Alert variant="error">A confirmação não corresponde à nova senha.</Alert></div> : null}
      <form className="mt-5 grid gap-5 sm:grid-cols-3" onSubmit={(event) => { event.preventDefault(); void savePassword(); }}><label><span className="mb-2 block text-sm font-semibold">Senha atual</span><input className="gm-input" required type="password" autoComplete="current-password" value={senhaAtual} onChange={(event) => setSenhaAtual(event.target.value)} /></label><label><span className="mb-2 block text-sm font-semibold">Nova senha</span><input className="gm-input" required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} /></label><label><span className="mb-2 block text-sm font-semibold">Confirmar nova senha</span><input className="gm-input" required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} /></label><div className="sm:col-span-3"><Button type="submit" isLoading={changePassword.isPending} disabled={novaSenha !== confirmacao}><KeyRound className="h-4 w-4" />Alterar senha</Button></div></form>
    </section>
  </div>;
}
