import { useState } from 'react';
import { Layers3, Plus } from 'lucide-react';
import { ClassDialog } from '@/components/classes/ClassDialog';
import { ClassFilters } from '@/components/classes/ClassFilters';
import { ClassesTable, ClassesTableSkeleton } from '@/components/classes/ClassesTable';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/hooks/useAuth';
import { useChangeClassStatus, useClasses } from '@/hooks/useClasses';
import { useCourses } from '@/hooks/useCourses';
import type { TurmaListada, TurmaSalva, TurmaStatusFiltro } from '@/types/classes.types';
import { getErrorMessage } from '@/utils/api-error';

const PAGE_SIZE = 20;
type DialogState = { mode: 'create' | 'edit' | 'clone'; target: TurmaListada | null } | null;
export function ClassesPage(): JSX.Element {
  const { user } = useAuth();
  const coordinator = user?.papel === 'COORDENADORA';
  const [page, setPage] = useState(1);
  const [draftCourse, setDraftCourse] = useState(''); const [course, setCourse] = useState('');
  const [draftStatus, setDraftStatus] = useState<TurmaStatusFiltro>(''); const [status, setStatus] = useState<TurmaStatusFiltro>('');
  const [dialog, setDialog] = useState<DialogState>(null); const [statusTarget, setStatusTarget] = useState<TurmaListada | null>(null);
  const [success, setSuccess] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const classesQuery = useClasses({ pagina: page, limite: PAGE_SIZE, cursoId: course || undefined, ativo: coordinator ? status === 'ATIVAS' ? true : status === 'INATIVAS' ? false : undefined : undefined });
  const coursesQuery = useCourses({ pagina: 1, limite: 100, apenas_meus: user?.papel === 'MENTOR' ? true : undefined });
  const activeCoursesQuery = useCourses({ pagina: 1, limite: 100, ativo: true });
  const statusMutation = useChangeClassStatus();
  const result = classesQuery.data; const items = result?.data ?? []; const courses = coursesQuery.data?.data ?? [];
  function clearMessages(): void { setSuccess(null); setError(null); }
  function saved(value: TurmaSalva, mode: 'create' | 'edit' | 'clone'): void { setDialog(null); setError(null); setSuccess(mode === 'create' ? `A turma ${value.codigo} foi cadastrada.` : mode === 'edit' ? `A turma ${value.codigo} foi atualizada.` : `A turma ${value.codigo} foi clonada com sua estrutura.`); }
  async function changeStatus(): Promise<void> { if (!statusTarget) return; const target = statusTarget; clearMessages(); try { const value = await statusMutation.mutateAsync({ id: target.id, ativo: !target.ativo }); setSuccess(`A turma ${value.codigo} foi ${value.ativo ? 'ativada' : 'desativada'}.`); } catch (e) { setError(getErrorMessage(e)); } finally { setStatusTarget(null); } }
  return <div className="mx-auto max-w-7xl space-y-6"><section className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold gm-text-primary">Estrutura acadêmica</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Turmas</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{coordinator ? 'Cadastre, edite e acompanhe os períodos, módulos e status das turmas.' : 'Consulte as turmas ativas dos cursos aos quais você está vinculado.'}</p></div><div className="flex items-center gap-3">{result ? <div className="rounded-xl border gm-border bg-white px-4 py-3 text-right shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Turmas encontradas</p><p className="mt-1 text-2xl font-bold text-slate-950">{result.meta.total}</p></div> : null}{coordinator ? <Button type="button" disabled={!activeCoursesQuery.data?.data.length} onClick={() => { clearMessages(); setDialog({ mode: 'create', target: null }); }}><Plus className="h-4 w-4" />Cadastrar turma</Button> : null}</div></section>
  {success ? <Alert variant="success" title="Operação concluída">{success}</Alert> : null}{error ? <Alert variant="error" title="Não foi possível atualizar a turma">{error}</Alert> : null}
  {coordinator && activeCoursesQuery.data && activeCoursesQuery.data.data.length === 0 ? <Alert variant="info" title="Nenhum curso ativo">Ative ou cadastre um curso antes de criar uma turma.</Alert> : null}
  <section className="gm-panel p-5 sm:p-6"><ClassFilters courseId={draftCourse} status={draftStatus} courses={courses} loading={classesQuery.isFetching} onCourseChange={setDraftCourse} onStatusChange={setDraftStatus} onSubmit={() => { setPage(1); setCourse(draftCourse); setStatus(draftStatus); }} onClear={() => { setPage(1); setDraftCourse(''); setCourse(''); setDraftStatus(''); setStatus(''); }} /></section>
  <section className="gm-panel overflow-hidden"><div className="border-b gm-border px-5 py-4"><h3 className="font-bold text-slate-950">{coordinator ? 'Turmas cadastradas' : 'Minhas turmas'}</h3><p className="mt-1 text-sm text-slate-500">Dados carregados diretamente da API.</p></div>{classesQuery.isLoading ? <ClassesTableSkeleton /> : null}{classesQuery.isError ? <div className="space-y-4 p-6"><Alert variant="error" title="Não foi possível carregar as turmas">{getErrorMessage(classesQuery.error)}</Alert><Button variant="secondary" onClick={() => void classesQuery.refetch()}>Tentar novamente</Button></div> : null}{!classesQuery.isLoading && !classesQuery.isError && items.length === 0 ? <EmptyState icon={<Layers3 className="h-7 w-7" />} title="Nenhuma turma encontrada" description={course || status ? 'Nenhuma turma corresponde aos filtros aplicados.' : 'Ainda não há turmas disponíveis.'} /> : null}{items.length > 0 ? <><ClassesTable classes={items} canManage={coordinator} disabled={statusMutation.isPending} onEdit={(target) => { clearMessages(); setDialog({ mode: 'edit', target }); }} onClone={(target) => { clearMessages(); setDialog({ mode: 'clone', target }); }} onStatus={(target) => { clearMessages(); setStatusTarget(target); }} /><Pagination page={page} totalPages={result?.meta.totalPaginas ?? 0} disabled={classesQuery.isFetching || statusMutation.isPending} onPageChange={setPage} /></> : null}</section>
  {coordinator ? <><ClassDialog open={dialog !== null} mode={dialog?.mode ?? 'create'} target={dialog?.target ?? null} courses={activeCoursesQuery.data?.data ?? []} onClose={() => setDialog(null)} onSaved={saved} /><ConfirmDialog open={statusTarget !== null} title={statusTarget?.ativo ? 'Desativar turma?' : 'Ativar turma?'} description={statusTarget?.ativo ? `A turma ${statusTarget.codigo} deixará de aceitar novos módulos, unidades e tarefas. Os dados existentes serão preservados.` : `A turma ${statusTarget?.codigo ?? ''} voltará a aceitar operações, desde que o curso esteja ativo.`} confirmLabel={statusTarget?.ativo ? 'Desativar turma' : 'Ativar turma'} isLoading={statusMutation.isPending} onClose={() => { if (!statusMutation.isPending) setStatusTarget(null); }} onConfirm={() => void changeStatus()} /></> : null}</div>;
}
