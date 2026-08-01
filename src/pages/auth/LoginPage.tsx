import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenCheck, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { FormField } from '@/components/forms/FormField';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/api-error';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .email('Informe um endereço de e-mail válido.')
    .max(254, 'O e-mail deve possuir no máximo 254 caracteres.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      await login(data);
      const state = location.state as LoginLocationState | null;
      navigate(state?.from ?? '/', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <main className="gm-app-background min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden overflow-hidden gm-login-hero p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10 flex items-center gap-3">
          <div className="gm-brand-icon-inverse h-12 w-12">
            <BookOpenCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Gestão de Mentores</p>
            <p className="text-sm text-blue-100/75">Organização, acompanhamento e clareza</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Ambiente protegido por perfil de acesso
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight text-white">
            Uma visão organizada do trabalho de cada mentor.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100/80">
            Acompanhe tarefas, estrutura acadêmica e resultados em uma interface construída para o dia a dia educacional.
          </p>
        </div>

        <p className="relative z-10 text-sm text-blue-100/60">
          Interface beta para ambiente local ou controlado.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="gm-brand-icon h-11 w-11">
              <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-950">Gestão de Mentores</p>
              <p className="text-xs text-slate-500">Ambiente educacional</p>
            </div>
          </div>

          <div className="gm-panel p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold gm-text-primary">Bem-vindo</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Acesse sua conta</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use o e-mail e a senha cadastrados pela coordenação.
              </p>
            </div>

            {serverError ? (
              <div className="mt-6">
                <Alert variant="error" title="Não foi possível entrar">
                  {serverError}
                </Alert>
              </div>
            ) : null}

            <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
              <FormField
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="nome@instituicao.com.br"
                leadingIcon={<Mail aria-hidden="true" className="h-5 w-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <FormField
                id="senha"
                label="Senha"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                leadingIcon={<LockKeyhole aria-hidden="true" className="h-5 w-5" />}
                error={errors.senha?.message}
                {...register('senha')}
              />

              <Button type="submit" className="w-full justify-center" isLoading={isSubmitting}>
                Entrar
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            O access token permanece somente em memória. O refresh token é mantido pelo backend em cookie HttpOnly.
          </p>
        </div>
      </section>
    </main>
  );
}
