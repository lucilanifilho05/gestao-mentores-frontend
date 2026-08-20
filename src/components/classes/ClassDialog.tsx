import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Hash, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { useCloneClass, useCreateClass, useUpdateClass } from '@/hooks/useClasses';
import { classSchema, type ClassFormData } from '@/schemas/class.schema';
import type { CursoListado } from '@/types/courses.types';
import type { TurmaListada, TurmaSalva } from '@/types/classes.types';
import { getErrorMessage } from '@/utils/api-error';

type Mode = 'create' | 'edit' | 'clone';
interface Props { open: boolean; mode: Mode; target: TurmaListada | null; courses: CursoListado[]; onClose: () => void; onSaved: (value: TurmaSalva, mode: Mode) => void }
const EMPTY: ClassFormData = { codigo: '', dataInicio: '', dataFim: '' };

export function ClassDialog({ open, mode, target, courses, onClose, onSaved }: Props): JSX.Element | null {
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const cloneMutation = useCloneClass();
  const mutation = mode === 'create' ? createMutation : mode === 'edit' ? updateMutation : cloneMutation;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClassFormData>({ resolver: zodResolver(classSchema), defaultValues: EMPTY });
  const defaultCourseId = courses[0]?.id ?? '';
  const selectableCourses = target && !courses.some((course) => course.id === target.curso.id)
    ? [target.curso, ...courses]
    : courses;
  const { register: registerCourse, handleSubmit: handleCourseSubmit, reset: resetCourse, formState: { errors: courseErrors } } = useForm<{ cursoId: string }>({ defaultValues: { cursoId: defaultCourseId } });

  useEffect(() => {
    if (!open) return;
    reset(target ? { codigo: mode === 'clone' ? `${target.codigo} - cópia` : target.codigo, dataInicio: target.dataInicio.slice(0, 10), dataFim: target.dataFim.slice(0, 10) } : EMPTY);
    resetCourse({ cursoId: target?.curso.id ?? defaultCourseId });
    mutation.reset();
  }, [open, target, mode, reset, resetCourse, defaultCourseId]);

  const pending = mutation.isPending;
  function close(): void { if (!pending) { mutation.reset(); onClose(); } }
  async function submit(data: ClassFormData, courseId?: string): Promise<void> {
    let saved: TurmaSalva;
    if (mode === 'create') saved = await createMutation.mutateAsync({ ...data, cursoId: courseId ?? '' });
    else if (mode === 'edit' && target) saved = await updateMutation.mutateAsync({ id: target.id, payload: { ...data, cursoId: courseId ?? target.curso.id } });
    else if (target) saved = await cloneMutation.mutateAsync({ id: target.id, payload: data });
    else return;
    onSaved(saved, mode);
    onClose();
  }

  if (!open) return null;
  const titles = { create: 'Cadastrar turma', edit: 'Editar turma', clone: 'Clonar turma' };
  const form = (
    <div className="space-y-5 px-6 py-6">
      {mutation.isError ? <Alert variant="error" title="Não foi possível salvar a turma">{getErrorMessage(mutation.error)}</Alert> : null}
      {mode === 'create' || (mode === 'edit' && target?.quantidadeTarefas === 0) ? <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Curso</span><select className={`gm-input ${courseErrors.cursoId ? 'gm-input-error' : ''}`} {...registerCourse('cursoId', { required: true })}><option value="">Selecione um curso</option>{selectableCourses.map((course) => <option key={course.id} value={course.id}>{course.nome}</option>)}</select>{courseErrors.cursoId ? <p className="mt-1.5 text-sm text-red-700">Selecione o curso da turma.</p> : null}</label> : <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Curso</p><p className="mt-1 font-semibold text-slate-900">{target?.curso.nome}</p>{mode === 'edit' && target?.quantidadeTarefas ? <p className="mt-1 text-xs text-slate-500">O curso não pode ser alterado porque esta turma possui tarefas vinculadas.</p> : null}</div>}
      <FormField id="codigo" label="Código da turma" maxLength={100} autoComplete="off" leadingIcon={<Hash className="h-4 w-4" />} error={errors.codigo?.message} {...register('codigo')} />
      <div className="grid gap-4 sm:grid-cols-2"><FormField id="dataInicio" label="Data de início" type="date" leadingIcon={<CalendarDays className="h-4 w-4" />} error={errors.dataInicio?.message} {...register('dataInicio')} /><FormField id="dataFim" label="Data de término" type="date" leadingIcon={<CalendarDays className="h-4 w-4" />} error={errors.dataFim?.message} {...register('dataFim')} /></div>
    </div>
  );
  const submitForm = mode === 'create' || mode === 'edit' ? handleCourseSubmit((course) => handleSubmit((data) => submit(data, course.cursoId))()) : handleSubmit((data) => submit(data));
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><div className="gm-panel w-full max-w-2xl overflow-hidden" role="dialog" aria-modal="true"><div className="flex items-start justify-between gap-5 border-b gm-border px-6 py-5"><div><p className="text-sm font-semibold gm-text-primary">Estrutura acadêmica</p><h2 className="mt-1 text-xl font-bold text-slate-950">{titles[mode]}</h2><p className="mt-2 text-sm text-slate-600">{mode === 'clone' ? 'A estrutura de módulos e unidades curriculares será replicada para o novo período.' : 'Informe o código e o período acadêmico da turma.'}</p></div><button type="button" aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" disabled={pending} onClick={close}><X className="h-5 w-5" /></button></div><form onSubmit={submitForm}>{form}<div className="flex flex-col-reverse gap-3 border-t gm-border bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" disabled={pending} onClick={close}>Cancelar</Button><Button type="submit" isLoading={pending}>{mode === 'create' ? 'Cadastrar turma' : mode === 'edit' ? 'Salvar alterações' : 'Clonar turma'}</Button></div></form></div></div>;
}
