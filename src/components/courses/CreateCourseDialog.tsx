import {
  BookOpen,
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
  useCreateCourse,
} from '@/hooks/useCreateCourse';

import {
  createCourseSchema,
  type CreateCourseFormData,
  type CreateCourseFormInput,
} from '@/schemas/create-course.schema';

import type {
  CursoCriado,
} from '@/types/courses.types';

import {
  ApiError,
  getErrorMessage,
} from '@/utils/api-error';

interface CreateCourseDialogProps {
  open: boolean;

  onClose: () => void;

  onCreated: (
    course: CursoCriado,
  ) => void;
}

const DEFAULT_VALUES: CreateCourseFormInput = {
  nome: '',
};

export function CreateCourseDialog({
  open,
  onClose,
  onCreated,
}: CreateCourseDialogProps): JSX.Element | null {
  const createCourseMutation =
    useCreateCourse();

  const {
    register,
    handleSubmit,
    reset,
    setError,

    formState: {
      errors,
    },
  } = useForm<
    CreateCourseFormInput,
    unknown,
    CreateCourseFormData
  >({
    resolver:
      zodResolver(
        createCourseSchema,
      ),

    defaultValues:
      DEFAULT_VALUES,
  });

  function closeDialog(): void {
    if (
      createCourseMutation.isPending
    ) {
      return;
    }

    reset(DEFAULT_VALUES);
    createCourseMutation.reset();
    onClose();
  }

  async function submit(
    data: CreateCourseFormData,
  ): Promise<void> {
    createCourseMutation.reset();

    try {
      const createdCourse =
        await createCourseMutation
          .mutateAsync({
            nome: data.nome,
          });

      reset(DEFAULT_VALUES);
      createCourseMutation.reset();

      onCreated(createdCourse);
      onClose();
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        setError('nome', {
          type: 'server',
          message:
            'Já existe um curso com esse nome.',
        });
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
          closeDialog();
        }
      }}
    >
      <div
        className="gm-panel w-full max-w-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-course-title"
      >
        <div className="flex items-start justify-between gap-5 border-b gm-border px-6 py-5">
          <div>
            <p className="text-sm font-semibold gm-text-primary">
              Catálogo acadêmico
            </p>

            <h2
              id="create-course-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Cadastrar curso
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              O curso será criado como
              ativo e poderá receber
              turmas e mentores.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar cadastro"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              createCourseMutation
                .isPending
            }
            onClick={closeDialog}
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
            {createCourseMutation
              .isError ? (
              <Alert
                variant="error"
                title="Não foi possível cadastrar o curso"
              >
                {getErrorMessage(
                  createCourseMutation
                    .error,
                )}
              </Alert>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                Nome do curso
              </span>

              <div className="relative">
                <BookOpen
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  className={`gm-input gm-input-leading ${
                    errors.nome
                      ? 'gm-input-error'
                      : ''
                  }`}
                  placeholder="Ex.: Gestão Industrial"
                  autoComplete="off"
                  maxLength={150}
                  aria-invalid={
                    Boolean(errors.nome)
                  }
                  {...register('nome')}
                />
              </div>

              {errors.nome ? (
                <p className="mt-1.5 text-sm text-red-700">
                  {
                    errors.nome
                      .message
                  }
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-slate-500">
                  Utilize entre 2 e 150
                  caracteres.
                </p>
              )}
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t gm-border bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={
                createCourseMutation
                  .isPending
              }
              onClick={closeDialog}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={
                createCourseMutation
                  .isPending
              }
            >
              Cadastrar curso
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
