import { useState } from "react";
import { CalendarClock, FolderKanban, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
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
  const navigate = useNavigate();
  const coordinator = user?.papel === "COORDENADORA";
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusProjeto | "">("");
  const projects = useProjects({
    pagina: 1,
    limite: 100,
    status: status || undefined,
  });
  const format = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
      new Date(value),
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
            onChange={(event) =>
              setStatus(event.target.value as StatusProjeto | "")
            }
          >
            <option value="">Todos</option>
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
        {projects.data?.data.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/projetos/${project.id}`)}
            format={format}
          />
        ))}
      </div>
      {projects.data?.data.length === 0 ? (
        <div className="gm-panel p-10 text-center text-slate-500">
          Nenhum projeto encontrado.
        </div>
      ) : null}
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(name) => {
          setCreateOpen(false);
          setMessage(`Projeto “${name}” criado.`);
        }}
      />
    </div>
  );
}

function ProjectCard({ project, onClick, format }: {
  project: Projeto;
  onClick: () => void;
  format: (value: string) => string;
}): JSX.Element {
  return (
    <button onClick={onClick} className="gm-panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
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
