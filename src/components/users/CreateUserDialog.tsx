import {
  LockKeyhole,
  Mail,
  UserRound,
  X,
} from 'lucide-react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  Alert,
} from '@/components/ui/Alert';

import {
  Button,
} from '@/components/ui/Button';

import {
  FormField,
} from '@/components/forms/FormField';

import {
  useCreateUser,
} from '@/hooks//useCreateUser';

import {
  createUserSchema,
  type CreateUserFormData,
  type CreateUserFormInput,
} from '@/schemas/create-user.schema';

import type {
  UsuarioCriado,
} from '@/types/users.types';

import {
  ApiError,
  getErrorMessage,
} from '@/utils/api-error';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;

  onCreated: (
    user: UsuarioCriado,
  ) => void;
}

const DEFAULT_VALUES: CreateUserFormInput = {
  nome: '',
  email: '',
  senha: '',
  papel: 'MENTOR',
};

const FORM_FIELDS = [
  'nome',
  'email',
  'senha',
  'papel',
] as const;

export function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps): JSX.Element | null {
  const createUserMutation =
    useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    setError,

    formState: {
      errors,
    },
  } = useForm<
    CreateUserFormInput,
    unknown,
    CreateUserFormData
  >({
    resolver:
      zodResolver(
        createUserSchema,
      ),

    defaultValues:
      DEFAULT_VALUES,
  });

  function clearAndClose(): void {
    if (
      createUserMutation.isPending
    ) {
      return;
    }

    reset(DEFAULT_VALUES);
    createUserMutation.reset();
    onClose();
  }

  function applyServerFieldErrors(
    error: ApiError,
  ): void {
    for (
      const field of FORM_FIELDS
    ) {
      const message =
        error.fieldErrors[field]?.[0];

      if (message) {
        setError(field, {
          type: 'server',
          message,
        });
      }
    }

    if (
      error.status === 409 &&
      !error.fieldErrors.email?.length
    ) {
      setError('email', {
        type: 'server',
        message:
          'Este e-mail já está cadastrado.',
      });
    }
  }

  async function submit(
    data: CreateUserFormData,
  ): Promise<void> {
    createUserMutation.reset();

    try {
      const createdUser =
        await createUserMutation
          .mutateAsync({
            nome:
              data.nome.replace(
                /\s+/g,
                ' ',
              ),

            email:
              data.email,

            senha:
              data.senha,

            papel:
              data.papel,
          });

      reset(DEFAULT_VALUES);
      createUserMutation.reset();

      onCreated(createdUser);
      onClose();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        applyServerFieldErrors(
          error,
        );
      }
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          clearAndClose();
        }
      }}
    >
      <div
        className="gm-panel w-full max-w-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
      >
        <div className="flex items-start justify-between gap-5 border-b gm-border px-6 py-5">
          <div>
            <p className="text-sm font-semibold gm-text-primary">
              Novo acesso
            </p>

            <h2
              id="create-user-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Cadastrar usuário
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre uma coordenadora
              ou um mentor para acessar
              o sistema.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar cadastro"
            disabled={
              createUserMutation
                .isPending
            }
            onClick={
              clearAndClose
            }
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit(submit)
          }
        >
          <div className="space-y-5 px-6 py-6">
            {createUserMutation
              .isError ? (
              <Alert
                variant="error"
                title="Não foi possível cadastrar o usuário"
              >
                {getErrorMessage(
                  createUserMutation
                    .error,
                )}
              </Alert>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField
                  id="create-user-name"
                  label="Nome completo"
                  placeholder="Informe o nome completo"
                  autoComplete="name"
                  maxLength={150}
                  leadingIcon={
                    <UserRound
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  }
                  error={
                    errors.nome?.message
                  }
                  {...register('nome')}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  id="create-user-email"
                  label="E-mail"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  autoComplete="email"
                  maxLength={254}
                  leadingIcon={
                    <Mail
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  }
                  error={
                    errors.email?.message
                  }
                  {...register('email')}
                />
              </div>

              <FormField
                id="create-user-password"
                label="Senha inicial"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                leadingIcon={
                  <LockKeyhole
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                }
                error={
                  errors.senha?.message
                }
                hint="A senha deve possuir entre 8 e 128 caracteres."
                {...register('senha')}
              />

              <div>
                <label
                  htmlFor="create-user-role"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Papel de acesso
                </label>

                <select
                  id="create-user-role"
                  className={`gm-input ${
                    errors.papel
                      ? 'gm-input-error'
                      : ''
                  }`}
                  aria-invalid={
                    Boolean(
                      errors.papel,
                    )
                  }
                  {...register('papel')}
                >
                  <option value="MENTOR">
                    Mentor
                  </option>

                  <option value="COORDENADORA">
                    Coordenadora
                  </option>
                </select>

                {errors.papel ? (
                  <p className="mt-1.5 text-sm text-red-700">
                    {
                      errors.papel
                        .message
                    }
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-500">
                    O papel determina as
                    áreas disponíveis no
                    sistema.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border gm-border bg-slate-50 px-4 py-3">
              <p className="text-sm leading-6 text-slate-600">
                O usuário será criado
                como ativo. A senha não
                será exibida novamente
                após o cadastro.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t gm-border bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={
                createUserMutation
                  .isPending
              }
              onClick={
                clearAndClose
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={
                createUserMutation
                  .isPending
              }
            >
              Cadastrar usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}