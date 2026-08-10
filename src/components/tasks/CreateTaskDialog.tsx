import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useActivityTypes, useCreateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useProjects } from "@/hooks/useProjects";
import type { EscopoTarefa, TarefaDetalhe } from "@/types/tasks.types";
import { getErrorMessage } from "@/utils/api-error";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (task: TarefaDetalhe) => void;
  initialProjectId?: string;
}
const inputClass = "gm-input";
export function CreateTaskDialog({
  open,
  onClose,
  onCreated,
  initialProjectId,
}: Props): JSX.Element | null {
  const { user } = useAuth();
  const mutation = useCreateTask();
  const [titulo, setTitulo] = useState("");
  const [projeto, setProjeto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [links, setLinks] = useState("");
  const [tipo, setTipo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [escopo, setEscopo] = useState<EscopoTarefa>("curso");
  const [curso, setCurso] = useState("");
  const [turma, setTurma] = useState("");
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const types = useActivityTypes();
  const projects = useProjects({ pagina: 1, limite: 100 });
  const courses = useCourses({
    pagina: 1,
    limite: 100,
    ativo: true,
    apenas_meus: user?.papel === "MENTOR" ? true : undefined,
  });
  const classes = useClasses({
    pagina: 1,
    limite: 100,
    cursoId: curso || undefined,
    ativo: true,
  });
  const mentors = useUsers({
    pagina: 1,
    limite: 100,
    papel: "MENTOR",
    ativo: true,
  });
  useEffect(() => {
    if (open) {
      setTitulo("");
      setProjeto(initialProjectId ?? "");
      setDescricao("");
      setLinks("");
      setTipo("");
      setResponsavel(user?.papel === "MENTOR" ? user.id : "");
      setEscopo("curso");
      setCurso("");
      setTurma("");
      setInicio("");
      setPrazo("");
      setValidation(null);
      mutation.reset();
    }
  }, [open]);
  if (!open) return null;
  const close = () => {
    if (!mutation.isPending) onClose();
  };
  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setValidation(null);
    if (!titulo.trim() || !projeto || !tipo || !responsavel || !prazo) {
      setValidation("Preencha os campos obrigatórios.");
      return;
    }
    if (escopo !== "evento_macro" && !curso) {
      setValidation("Selecione o curso da tarefa.");
      return;
    }
    if (escopo === "turma" && !turma) {
      setValidation("Selecione a turma da tarefa.");
      return;
    }
    if (inicio && prazo < inicio) {
      setValidation("O prazo final não pode ser anterior ao inicial.");
      return;
    }
    try {
      const task = await mutation.mutateAsync({
        projetoId: projeto,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        tipoAtividadeId: tipo,
        responsavelId: responsavel,
        escopo,
        cursoId: escopo === "evento_macro" ? undefined : curso,
        turmaId: escopo === "turma" ? turma : undefined,
        prazoInicio: inicio ? new Date(inicio).toISOString() : undefined,
        prazoAtual: new Date(prazo).toISOString(),
        links: links
          .split(/\r?\n/)
          .map((link) => link.trim())
          .filter(Boolean),
      });
      onCreated(task);
    } catch {
      /* exibido pela mutation */
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="gm-panel w-full max-w-3xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between border-b gm-border px-6 py-5">
          <div>
            <p className="text-sm font-semibold gm-text-primary">Backlog</p>
            <h2 className="mt-1 text-xl font-bold">Criar tarefa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Defina o responsável, o contexto e o prazo de entrega.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => void submit(e)}>
          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            {validation ? (
              <div className="sm:col-span-2">
                <Alert variant="error" title="Revise os dados">
                  {validation}
                </Alert>
              </div>
            ) : null}
            {mutation.isError ? (
              <div className="sm:col-span-2">
                <Alert variant="error" title="Não foi possível criar a tarefa">
                  {getErrorMessage(mutation.error)}
                </Alert>
              </div>
            ) : null}
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Projeto *
              </span>
              <select
                className="gm-input"
                disabled={Boolean(initialProjectId)}
                value={projeto}
                onChange={(e) => setProjeto(e.target.value)}
              >
                <option value="">Selecione</option>
                {projects.data?.data
                  .filter(
                    (x) =>
                      x.status === "planejamento" ||
                      x.status === "em_andamento",
                  )
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Título *</span>
              <input
                className={inputClass}
                maxLength={200}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Escopo *</span>
              <select
                className={inputClass}
                value={escopo}
                onChange={(e) => {
                  setEscopo(e.target.value as EscopoTarefa);
                  setCurso("");
                  setTurma("");
                }}
              >
                <option value="curso">Curso</option>
                <option value="turma">Turma</option>
                <option value="evento_macro">Evento macro</option>
              </select>
            </label>
            {escopo !== "evento_macro" ? (
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Curso *
                </span>
                <select
                  className={inputClass}
                  value={curso}
                  onChange={(e) => {
                    setCurso(e.target.value);
                    setTurma("");
                  }}
                >
                  <option value="">Selecione</option>
                  {courses.data?.data.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div />
            )}
            {escopo === "turma" ? (
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Turma *
                </span>
                <select
                  className={inputClass}
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {classes.data?.data.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.codigo}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Tipo de atividade *
              </span>
              <select
                className={inputClass}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Selecione</option>
                {types.data?.data.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Responsável *
              </span>
              <select
                className={inputClass}
                disabled={user?.papel === "MENTOR"}
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              >
                <option value="">Selecione</option>
                {user?.papel === "MENTOR" ? (
                  <option value={user.id}>{user.nome}</option>
                ) : (
                  mentors.data?.data.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Início</span>
              <input
                className={inputClass}
                type="datetime-local"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Prazo final *
              </span>
              <input
                className={inputClass}
                type="datetime-local"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Descrição
              </span>
              <textarea
                className="gm-input h-28 py-3"
                maxLength={5000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Links para arquivos
              </span>
              <textarea
                className="gm-input h-24 py-3"
                placeholder="Cole um link HTTP ou HTTPS por linha"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Os arquivos devem estar compartilhados no serviço de
                armazenamento escolhido.
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t gm-border bg-slate-50/70 px-6 py-4">
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={close}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Criar tarefa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
