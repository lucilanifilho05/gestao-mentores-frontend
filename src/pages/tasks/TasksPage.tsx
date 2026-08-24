import { useState } from "react";
import { CheckCircle2, Clock3, FilterX, ListFilter, Plus, TriangleAlert } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { isOverdue, TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useActivityTypes, useCompleteTask, useTasks } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import type { EscopoTarefa, StatusTarefa, TarefaResumo } from "@/types/tasks.types";
import { getErrorMessage } from "@/utils/api-error";

function Column({ title, description, icon, tasks, empty, onOpen, onEdit, onComplete, actionsDisabled }: {
  title: string; description: string; icon: JSX.Element; tasks: TarefaResumo[]; empty: string;
  onOpen: (id: string) => void; onEdit: (id: string) => void; onComplete: (task: TarefaResumo) => void; actionsDisabled: boolean;
}): JSX.Element {
  return <section className="min-w-0 rounded-2xl bg-slate-100/80 p-3">
    <div className="flex items-start justify-between gap-3 px-1 py-2"><div className="flex gap-2"><span className="mt-0.5">{icon}</span><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-0.5 text-xs text-slate-500">{description}</p></div></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">{tasks.length}</span></div>
    <div className="mt-2 space-y-3">{tasks.map((task) => <TaskCard key={task.id} task={task} onClick={() => onOpen(task.id)} onEdit={task.status === "pendente" ? () => onEdit(task.id) : undefined} onComplete={task.status === "pendente" ? () => onComplete(task) : undefined} actionsDisabled={actionsDisabled} />)}{tasks.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">{empty}</div> : null}</div>
  </section>;
}

export function TasksPage(): JSX.Element {
  const { user } = useAuth();
  const coordinator = user?.papel === "COORDENADORA";
  const [status, setStatus] = useState<StatusTarefa | "">("");
  const [scope, setScope] = useState<EscopoTarefa | "">("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [course, setCourse] = useState("");
  const [classId, setClassId] = useState("");
  const [owner, setOwner] = useState("");
  const [activityTypeId, setActivityTypeId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<TarefaResumo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const complete = useCompleteTask();
  const tasks = useTasks({ pagina: 1, limite: 100, inicio: inicio || undefined, fim: fim || undefined, status: status || undefined, escopo: scope || undefined, cursoId: course || undefined, turmaId: classId || undefined, tipoAtividadeId: activityTypeId || undefined, responsavelId: coordinator ? owner || undefined : undefined });
  const courses = useCourses({ pagina: 1, limite: 100, apenas_meus: user?.papel === "MENTOR" ? true : undefined });
  const classes = useClasses({ pagina: 1, limite: 100, cursoId: course || undefined });
  const mentors = useUsers({ pagina: 1, limite: 100, papel: "MENTOR", ativo: true });
  const activityTypes = useActivityTypes(false);
  const hasFilters = Boolean(inicio || fim || status || scope || course || classId || owner || activityTypeId);
  function clearFilters(): void {
    setInicio(""); setFim(""); setStatus(""); setScope(""); setCourse(""); setClassId(""); setOwner(""); setActivityTypeId("");
  }
  const all = tasks.data?.data ?? [];
  const overdue = all.filter(isOverdue);
  const pending = all.filter((item) => item.status === "pendente" && !isOverdue(item));
  const done = all.filter((item) => item.status === "concluida");
  const columnActions = {
    onOpen: setSelected,
    onEdit: setEditing,
    onComplete: setCompleteTarget,
    actionsDisabled: complete.isPending,
  };

  async function confirmComplete(): Promise<void> {
    if (!completeTarget) return;
    try {
      await complete.mutateAsync(completeTarget.id);
      setMessage(`A tarefa “${completeTarget.titulo}” foi concluída.`);
      setOperationError(null);
      setCompleteTarget(null);
    } catch (error) {
      setOperationError(getErrorMessage(error));
      setCompleteTarget(null);
    }
  }

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold gm-text-primary">Planejamento e execução</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Backlog de tarefas</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{coordinator ? "Acompanhe entregas, responsáveis e prazos de toda a operação." : "Organize e acompanhe as tarefas atribuídas a você."}</p></div><Button onClick={() => { setMessage(null); setCreateOpen(true); }}><Plus className="h-4 w-4" />Nova tarefa</Button></section>
    {message ? <Alert variant="success" title="Operação concluída">{message}</Alert> : null}
    {operationError ? <Alert variant="error" title="Não foi possível concluir a tarefa">{operationError}</Alert> : null}
    <section className="gm-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b gm-border pb-4"><div className="flex items-center gap-2"><ListFilter className="h-5 w-5 gm-text-primary" /><div><h3 className="font-bold text-slate-950">Filtros</h3><p className="text-sm text-slate-500">Refine o backlog pelos mesmos critérios disponíveis nos relatórios.</p></div></div>{tasks.isFetching && !tasks.isLoading ? <span className="text-xs font-semibold gm-text-primary">Atualizando…</span> : null}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">De</span><input className="gm-input" type="date" value={inicio} max={fim || undefined} onChange={(event) => setInicio(event.target.value)} /></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Até</span><input className="gm-input" type="date" value={fim} min={inicio || undefined} onChange={(event) => setFim(event.target.value)} /></label>
        {coordinator ? <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Mentor</span><select className="gm-input" value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">Todos</option>{mentors.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label> : null}
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Curso</span><select className="gm-input" value={course} onChange={(event) => { setCourse(event.target.value); setClassId(""); }}><option value="">Todos</option>{courses.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Turma</span><select className="gm-input" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="">Todas</option>{classes.data?.data.map((item) => <option key={item.id} value={item.id}>{item.codigo}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Tipo de atividade</span><select className="gm-input" value={activityTypeId} onChange={(event) => setActivityTypeId(event.target.value)}><option value="">Todos</option>{activityTypes.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? "" : " (inativo)"}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Status</span><select className="gm-input" value={status} onChange={(event) => setStatus(event.target.value as StatusTarefa | "")}><option value="">Todos</option><option value="pendente">Pendentes</option><option value="concluida">Concluídas</option></select></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Escopo</span><select className="gm-input" value={scope} onChange={(event) => setScope(event.target.value as EscopoTarefa | "")}><option value="">Todos</option><option value="curso">Curso</option><option value="turma">Turma</option><option value="evento_macro">Evento macro</option></select></label>
      </div>
      {hasFilters ? <Button className="mt-4" variant="ghost" onClick={clearFilters}><FilterX className="h-4 w-4" />Limpar filtros</Button> : null}
    </section>
    {tasks.isError ? <Alert variant="error" title="Não foi possível carregar o backlog">{getErrorMessage(tasks.error)}</Alert> : null}
    {tasks.isLoading ? <div className="grid gap-4 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-slate-100" />)}</div> : null}
    {!tasks.isLoading && !tasks.isError ? <div className="grid items-start gap-4 lg:grid-cols-3"><Column title="Atrasadas" description="Pendências com prazo vencido" icon={<TriangleAlert className="h-5 w-5 text-red-600" />} tasks={overdue} empty="Nenhuma tarefa atrasada." {...columnActions} /><Column title="Pendentes" description="Próximas entregas" icon={<Clock3 className="h-5 w-5 text-amber-600" />} tasks={pending} empty="Nenhuma tarefa pendente." {...columnActions} /><Column title="Concluídas" description="Entregas finalizadas" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} tasks={done} empty="Nenhuma tarefa concluída." {...columnActions} /></div> : null}
    {tasks.data && tasks.data.meta.total > 100 ? <Alert variant="info" title="Backlog parcial">Exibindo as primeiras 100 tarefas. Use os filtros para refinar a visualização.</Alert> : null}
    <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(result) => { setCreateOpen(false); setMessage(`A tarefa “${result.titulo}” foi criada.`); }} />
    <EditTaskDialog taskId={editing} onClose={() => setEditing(null)} onSaved={setMessage} />
    <TaskDetailDialog taskId={selected} onClose={() => setSelected(null)} onChanged={setMessage} />
    <ConfirmDialog open={completeTarget !== null} title="Concluir tarefa?" description={`A tarefa “${completeTarget?.titulo ?? ""}” não poderá mais ser editada ou reagendada.`} confirmLabel="Concluir tarefa" isLoading={complete.isPending} onClose={() => { if (!complete.isPending) setCompleteTarget(null); }} onConfirm={() => void confirmComplete()} />
  </div>;
}
