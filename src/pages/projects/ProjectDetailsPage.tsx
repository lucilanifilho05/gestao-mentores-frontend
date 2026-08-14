import { useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Plus, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCancelProject, useConcludeProject, useProject } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import type { StatusProjeto } from "@/types/projects.types";
import { getErrorMessage } from "@/utils/api-error";

const statusLabel: Record<StatusProjeto, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function ProjectDetailsPage(): JSX.Element {
  const { projetoId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const project = useProject(projetoId || null);
  const tasks = useTasks({ pagina: 1, limite: 100, projetoId });
  const conclude = useConcludeProject();
  const cancel = useCancelProject();
  const active = project.data;
  const coordinator = user?.papel === "COORDENADORA";
  const canChange = active?.status !== "concluido" && active?.status !== "cancelado";
  const format = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));

  if (project.isLoading) {
    return <div className="mx-auto max-w-[1500px] space-y-4"><div className="h-36 animate-pulse rounded-2xl bg-slate-100" /><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (project.isError || !active) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-5">
        <BackButton onClick={() => navigate("/projetos")} />
        <Alert variant="error" title="Não foi possível carregar o projeto">
          {project.isError ? getErrorMessage(project.error) : "Projeto não encontrado."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <BackButton onClick={() => navigate("/projetos")} />
      <section className="gm-panel p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <p className="text-sm font-semibold gm-text-primary">{statusLabel[active.status]}</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-950">{active.nome}</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <CalendarClock className="h-4 w-4" />
              Prazo final: {format(active.prazoFinal)}
            </p>
            {active.descricao ? <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">{active.descricao}</p> : null}
          </div>
          {canChange ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setTaskOpen(true)}><Plus className="h-4 w-4" />Nova tarefa</Button>
              {coordinator ? (
                <>
                  <Button variant="secondary" isLoading={conclude.isPending} onClick={async () => {
                    try { await conclude.mutateAsync(active.id); setMessage("Projeto concluído."); } catch { /* exibido abaixo */ }
                  }}><CheckCircle2 className="h-4 w-4" />Concluir projeto</Button>
                  <Button variant="secondary" isLoading={cancel.isPending} onClick={async () => {
                    try { await cancel.mutateAsync(active.id); setMessage("Projeto cancelado."); } catch { /* exibido abaixo */ }
                  }}><XCircle className="h-4 w-4" />Cancelar</Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {message ? <Alert variant="success" title="Operação concluída">{message}</Alert> : null}
      {conclude.isError || cancel.isError ? <Alert variant="error" title="Não foi possível alterar o projeto">{getErrorMessage(conclude.error ?? cancel.error)}</Alert> : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950">Tarefas ({tasks.data?.meta.total ?? 0})</h3>
          <p className="mt-1 text-sm text-slate-500">Acompanhe as atividades vinculadas a este projeto.</p>
        </div>
        {tasks.isError ? <Alert variant="error" title="Não foi possível carregar as tarefas">{getErrorMessage(tasks.error)}</Alert> : null}
        {tasks.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-slate-100" />)}</div> : null}
        {!tasks.isLoading && !tasks.isError ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.data?.data.map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task.id)} />)}
          </div>
        ) : null}
        {tasks.data?.data.length === 0 ? <div className="gm-panel p-10 text-center text-sm text-slate-500">Nenhuma tarefa cadastrada neste projeto.</div> : null}
        {tasks.data && tasks.data.meta.total > 100 ? <Alert variant="info" title="Listagem parcial">Exibindo as primeiras 100 tarefas deste projeto.</Alert> : null}
      </section>

      <TaskDetailDialog taskId={selectedTask} onClose={() => setSelectedTask(null)} onChanged={async (text) => {
        setMessage(text); await tasks.refetch(); await project.refetch();
      }} />
      <CreateTaskDialog open={taskOpen} initialProjectId={active.id} onClose={() => setTaskOpen(false)} onCreated={async (result) => {
        setTaskOpen(false);
        setMessage("quantidadeCriada" in result ? `${result.quantidadeCriada} tarefas macro foram criadas.` : `Tarefa “${result.titulo}” criada.`);
        await tasks.refetch(); await project.refetch();
      }} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }): JSX.Element {
  return <Button variant="ghost" onClick={onClick}><ArrowLeft className="h-4 w-4" />Voltar para projetos</Button>;
}
