import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Plus,
  XCircle,
} from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  useCancelProject,
  useConcludeProject,
  useProject,
  useProjects,
} from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import type { Projeto, StatusProjeto } from "@/types/projects.types";
import { getErrorMessage } from "@/utils/api-error";

const statusLabel: Record<StatusProjeto, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
export function ProjectsPage(): JSX.Element {
  const { user } = useAuth();
  const coordinator = user?.papel === "COORDENADORA";
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusProjeto | "">("");
  const projects = useProjects({
    pagina: 1,
    limite: 100,
    status: status || undefined,
  });
  const project = useProject(selected);
  const tasks = useTasks({
    pagina: 1,
    limite: 100,
    projetoId: selected || undefined,
  });
  const conclude = useConcludeProject();
  const cancel = useCancelProject();
  const active = project.data;
  const format = (v: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
      new Date(v),
    );
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold gm-text-primary">Planejamento</p>
          <h2 className="mt-1 text-3xl font-bold">Projetos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Agrupe e acompanhe as tarefas por iniciativa.
          </p>
        </div>
        {coordinator ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo projeto
          </Button>
        ) : null}
      </section>
      {message ? (
        <Alert variant="success" title="Operação concluída">
          {message}
        </Alert>
      ) : null}
      <section className="gm-panel p-5">
        <label className="block max-w-xs">
          <span className="mb-2 block text-sm font-semibold">Status</span>
          <select
            className="gm-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusProjeto | "")}
          >
            <option value="">Todos</option>
            {Object.entries(statusLabel).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </section>
      {projects.isError ? (
        <Alert variant="error" title="Não foi possível carregar projetos">
          {getErrorMessage(projects.error)}
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.data?.data.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onClick={() => setSelected(p.id)}
            format={format}
          />
        ))}
      </div>
      {projects.data?.data.length === 0 ? (
        <div className="gm-panel p-10 text-center text-slate-500">
          Nenhum projeto encontrado.
        </div>
      ) : null}
      {active ? (
        <div
          className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="gm-panel mx-auto my-8 max-w-5xl">
            <div className="flex justify-between border-b gm-border p-6">
              <div>
                <p className="text-sm font-semibold gm-text-primary">
                  {statusLabel[active.status]}
                </p>
                <h2 className="text-2xl font-bold">{active.nome}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Prazo final: {format(active.prazoFinal)}
                </p>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="space-y-6 p-6">
              {active.descricao ? (
                <p className="text-sm leading-6 text-slate-600">
                  {active.descricao}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {active.status !== "concluido" &&
                active.status !== "cancelado" ? (
                  <Button onClick={() => setTaskOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Nova tarefa
                  </Button>
                ) : null}
                {coordinator &&
                active.status !== "concluido" &&
                active.status !== "cancelado" ? (
                  <>
                    <Button
                      variant="secondary"
                      isLoading={conclude.isPending}
                      onClick={async () => {
                        await conclude.mutateAsync(active.id);
                        await project.refetch();
                        setMessage("Projeto concluído.");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir projeto
                    </Button>
                    <Button
                      variant="secondary"
                      isLoading={cancel.isPending}
                      onClick={async () => {
                        await cancel.mutateAsync(active.id);
                        await project.refetch();
                        setMessage("Projeto cancelado.");
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                ) : null}
              </div>
              {conclude.isError || cancel.isError ? (
                <Alert
                  variant="error"
                  title="Não foi possível alterar o projeto"
                >
                  {getErrorMessage(conclude.error ?? cancel.error)}
                </Alert>
              ) : null}
              <div>
                <h3 className="mb-3 font-bold">
                  Tarefas ({tasks.data?.meta.total ?? 0})
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {tasks.data?.data.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onClick={() => setSelectedTask(t.id)}
                    />
                  ))}
                </div>
                {tasks.data?.data.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhuma tarefa cadastrada.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <TaskDetailDialog
        taskId={selectedTask}
        onClose={() => setSelectedTask(null)}
        onChanged={async (text) => {
          setMessage(text);
          await tasks.refetch();
          await project.refetch();
        }}
      />
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(name) => {
          setCreateOpen(false);
          setMessage(`Projeto “${name}” criado.`);
        }}
      />
      <CreateTaskDialog
        open={taskOpen}
        initialProjectId={selected ?? undefined}
        onClose={() => setTaskOpen(false)}
        onCreated={async (t) => {
          setTaskOpen(false);
          setMessage(`Tarefa “${t.titulo}” criada.`);
          await tasks.refetch();
          await project.refetch();
        }}
      />
    </div>
  );
}
function ProjectCard({
  project,
  onClick,
  format,
}: {
  project: Projeto;
  onClick: () => void;
  format: (v: string) => string;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="gm-panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex justify-between">
        <FolderKanban className="h-5 w-5 gm-text-primary" />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
          {statusLabel[project.status]}
        </span>
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{project.nome}</h3>
      <p className="mt-2 text-sm text-slate-500">Agrupamento de tarefas</p>
      <div className="mt-4 flex justify-between border-t gm-border pt-3 text-xs text-slate-600">
        <span>{project._count.tarefas} tarefas</span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {format(project.prazoFinal)}
        </span>
      </div>
    </button>
  );
}
