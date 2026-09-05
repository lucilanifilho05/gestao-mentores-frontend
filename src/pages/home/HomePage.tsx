import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardList, Clock3, FilterX, Paperclip, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { useUsers } from "@/hooks/useUsers";
import { getErrorMessage } from "@/utils/api-error";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function Metric({ label, value, detail, icon, variant }: { label: string; value: number; detail: string; icon: JSX.Element; variant: "primary" | "secondary" | "danger" | "success" }): JSX.Element {
  return <article className="gm-panel p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p></div><div className={`gm-dashboard-metric-icon gm-dashboard-metric-${variant}`}>{icon}</div></div><p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p></article>;
}

export function HomePage(): JSX.Element {
  const { user } = useAuth();
  const coordinator = user?.papel === "COORDENADORA";
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [mentor, setMentor] = useState("");
  const [course, setCourse] = useState("");
  const [classId, setClassId] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const dashboard = useDashboardTasks({ inicio: inicio || undefined, fim: fim || undefined, mentorId: coordinator ? mentor || undefined : undefined, cursoId: course || undefined, turmaId: classId || undefined });
  const courses = useCourses({ pagina: 1, limite: 100, apenas_meus: user?.papel === "MENTOR" ? true : undefined });
  const classes = useClasses({ pagina: 1, limite: 100, cursoId: course || undefined });
  const mentors = useUsers({ pagina: 1, limite: 100, papel: "MENTOR", ativo: true });
  const stats = useMemo(() => {
    const tasks = dashboard.data ?? [];
    const planned = tasks.filter((task) => task.status === "planejada");
    const inProgress = tasks.filter((task) => task.status === "em_andamento");
    const overdue = tasks.filter((task) => task.status === "atrasada");
    const done = tasks.filter((task) => task.status === "concluida");
    return { tasks, planned, inProgress, overdue, done, rate: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0, links: tasks.reduce((sum, task) => sum + task.quantidadeLinks, 0) };
  }, [dashboard.data]);
  const upcoming = useMemo(() => [...stats.planned, ...stats.inProgress].sort((a, b) => new Date(a.prazoAtual).getTime() - new Date(b.prazoAtual).getTime()).slice(0, 5), [stats.planned, stats.inProgress]);
  const scopeData = ([ ["curso", "Curso"], ["turma", "Turma"], ["evento_macro", "Evento macro"] ] as const).map(([scope, label]) => ({ scope, label, count: stats.tasks.filter((task) => task.escopo === scope).length }));
  const maxScope = Math.max(1, ...scopeData.map((item) => item.count));
  const hasFilters = Boolean(inicio || fim || mentor || course || classId);
  function clearFilters(): void { setInicio(""); setFim(""); setMentor(""); setCourse(""); setClassId(""); }
  if (!user) return <></>;

  return <div className="mx-auto max-w-[1440px] space-y-6">
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="gm-eyebrow">Visão geral</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Olá, {user.nome.split(" ")[0]}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Acompanhe prioridades, entregas e o andamento do trabalho em um só lugar.</p></div><Link className="gm-link inline-flex items-center gap-2 self-start md:self-auto" to="/tarefas">Ver todas as tarefas <ArrowRight className="h-4 w-4" /></Link></section>

    <section className="gm-dashboard-summary overflow-hidden rounded-2xl p-6 sm:p-7"><div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-semibold text-blue-100">Progresso no período</p><div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1"><strong className="text-4xl font-extrabold tracking-tight text-white">{stats.rate}%</strong><span className="pb-1 text-sm text-blue-100">das tarefas concluídas</span></div><div className="mt-5 h-2 max-w-2xl overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full gm-bg-secondary" style={{ width: `${stats.rate}%` }} /></div><p className="mt-3 text-xs text-blue-100/80">{dashboard.isFetching ? "Atualizando informações…" : `${stats.tasks.length} tarefas consideradas no recorte atual`}</p></div><div className="grid grid-cols-2 gap-3 sm:flex"><div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><p className="text-xs text-blue-100">Em andamento</p><p className="mt-1 text-2xl font-bold text-white">{stats.inProgress.length}</p></div><div className="rounded-xl border border-orange-300/20 bg-orange-400/15 px-4 py-3"><p className="text-xs text-orange-100">Precisam de atenção</p><p className="mt-1 text-2xl font-bold text-white">{stats.overdue.length}</p></div></div></div></section>

    <details className="gm-panel group p-5" open={hasFilters}><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-800"><span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 gm-text-primary" />Refinar indicadores</span><span className="text-xs font-medium text-slate-500">{hasFilters ? "Filtros aplicados" : "Opcional"}</span></summary><div className="mt-5 grid gap-4 border-t gm-border pt-5 sm:grid-cols-2 lg:grid-cols-5">
      <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">De</span><input className="gm-input" type="date" value={inicio} max={fim || undefined} onChange={(e) => setInicio(e.target.value)} /></label>
      <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Até</span><input className="gm-input" type="date" value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} /></label>
      {coordinator ? <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Mentor</span><select className="gm-input" value={mentor} onChange={(e) => setMentor(e.target.value)}><option value="">Todos</option>{mentors.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label> : null}
      <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Curso</span><select className="gm-input" value={course} onChange={(e) => { setCourse(e.target.value); setClassId(""); }}><option value="">Todos</option>{courses.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
      <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Turma</span><select className="gm-input" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Todas</option>{classes.data?.data.map((item) => <option key={item.id} value={item.id}>{item.codigo}</option>)}</select></label>
    </div>{hasFilters ? <Button className="mt-4" variant="secondary" onClick={clearFilters}><FilterX className="h-4 w-4" />Limpar filtros</Button> : null}</details>

    {operationMessage ? <Alert variant="success" title="Operação concluída">{operationMessage}</Alert> : null}
    {dashboard.isError ? <Alert variant="error" title="Não foi possível carregar os indicadores">{getErrorMessage(dashboard.error)}</Alert> : null}
    {dashboard.isLoading ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Carregando indicadores">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200/60" />)}</section> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Total de tarefas" value={stats.tasks.length} detail="No período selecionado" icon={<ClipboardList className="h-5 w-5" />} variant="primary" /><Metric label="Planejadas" value={stats.planned.length} detail="Ainda não iniciadas" icon={<Clock3 className="h-5 w-5" />} variant="secondary" /><Metric label="Em andamento" value={stats.inProgress.length} detail="Em execução" icon={<CalendarClock className="h-5 w-5" />} variant="primary" /><Metric label="Atrasadas" value={stats.overdue.length} detail="Com prazo vencido" icon={<AlertTriangle className="h-5 w-5" />} variant="danger" /><Metric label="Concluídas" value={stats.done.length} detail={`${stats.rate}% do total`} icon={<CheckCircle2 className="h-5 w-5" />} variant="success" /></section>}

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"><section className="gm-panel overflow-hidden"><div className="flex items-start justify-between gap-4 border-b gm-border px-5 py-4 sm:px-6"><div><h3 className="font-bold text-slate-950">Próximas entregas</h3><p className="mt-1 text-sm text-slate-500">Selecione uma atividade para consultar os detalhes</p></div><CalendarClock className="h-5 w-5 text-slate-400" /></div><div className="divide-y gm-border">{upcoming.map((task, index) => <div key={task.id} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${index === 0 ? "gm-secondary-badge" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span><div className="min-w-0"><button type="button" className="block max-w-full truncate text-left font-semibold text-slate-950 transition hover:text-blue-700 hover:underline" onClick={() => setSelectedTask(task.id)} aria-label={`Abrir detalhes da tarefa ${task.numero}: ${task.titulo}`}>{task.titulo}</button><p className="mt-1 truncate text-xs text-slate-500"><span className="font-bold text-slate-600">ID global #{task.numero}</span> · {task.responsavel.nome} · {task.turma?.codigo ?? task.curso?.nome ?? "Evento macro"}</p></div></div><span className="inline-flex shrink-0 items-center gap-2 pl-10 text-sm font-semibold text-slate-700 sm:pl-0"><CalendarClock className="h-4 w-4 text-slate-400" />{formatDate(task.prazoAtual)}</span></div>)}{upcoming.length === 0 ? <div className="px-6 py-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-3 font-semibold text-slate-800">Nenhuma entrega futura</p><p className="mt-1 text-sm text-slate-500">Não há tarefas abertas para o período selecionado.</p></div> : null}</div></section>
      <section className="gm-panel p-5 sm:p-6"><h3 className="font-bold text-slate-950">Distribuição das tarefas</h3><p className="mt-1 text-sm text-slate-500">Quantidade por tipo de escopo</p><div className="mt-6 space-y-5">{scopeData.map((item, index) => <div key={item.scope}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700">{item.label}</span><strong className="text-slate-950">{item.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={index === 1 ? "h-full rounded-full gm-bg-secondary" : "h-full rounded-full bg-blue-700"} style={{ width: `${(item.count / maxScope) * 100}%` }} /></div></div>)}</div><div className="mt-7 flex items-center gap-3 rounded-xl gm-secondary-surface p-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm"><Paperclip className="h-5 w-5" /></span><div><p className="text-2xl font-extrabold text-slate-950">{stats.links}</p><p className="text-xs text-slate-600">links adicionados às tarefas</p></div></div></section>
    </div>
    <TaskDetailDialog taskId={selectedTask} onClose={() => setSelectedTask(null)} onChanged={setOperationMessage} />
  </div>;
}
