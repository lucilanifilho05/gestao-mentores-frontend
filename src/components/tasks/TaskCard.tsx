import { CalendarClock, CheckCircle2, Clock3, MessageSquare, Pencil, UserRound } from "lucide-react";
import type { TarefaResumo } from "@/types/tasks.types";

export function isOverdue(task: TarefaResumo): boolean {
  return task.status === "pendente" && new Date(task.prazoAtual).getTime() < Date.now();
}

export function TaskCard({
  task,
  onClick,
  onEdit,
  onComplete,
  actionsDisabled = false,
}: {
  task: TarefaResumo;
  onClick: () => void;
  onEdit?: () => void;
  onComplete?: () => void;
  actionsDisabled?: boolean;
}): JSX.Element {
  const overdue = isOverdue(task);
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(task.prazoAtual));
  const hasActions = task.status === "pendente" && (onEdit || onComplete);

  return (
    <article className={`w-full overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md ${task.possuiComentarioNaoLido ? "border-amber-400 ring-2 ring-amber-100" : "gm-border"}`}>
      <button type="button" onClick={onClick} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold gm-text-primary">{task.tipoAtividadeNome}</span>
            <span className="text-xs font-bold text-slate-500" title="Identificador da tarefa">#{task.numero}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">{task.quantidadeComentarios > 0 ? <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${task.possuiComentarioNaoLido ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`} title={`${task.quantidadeComentarios} comentário(s)`}><MessageSquare className="h-3.5 w-3.5" />{task.quantidadeComentarios}</span> : null}{task.quantidadeReagendamentos > 0 ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><Clock3 className="h-3.5 w-3.5" />{task.quantidadeReagendamentos}</span> : null}</div>
        </div>
        <h4 className="mt-3 font-bold leading-5 text-slate-950">{task.titulo}</h4>
        <p className="mt-2 text-xs text-slate-500">{task.escopo === "evento_macro" ? "Evento macro" : task.turmaCodigo ? `${task.cursoNome} · ${task.turmaCodigo}` : task.cursoNome}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t gm-border pt-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-slate-600"><UserRound className="h-3.5 w-3.5 shrink-0" />{task.responsavel.nome}</span>
          <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-bold ${overdue ? "text-red-700" : task.status === "concluida" ? "text-emerald-700" : "text-slate-600"}`}>{task.status === "concluida" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}{date}</span>
        </div>
      </button>
      {hasActions ? (
        <div className="grid grid-cols-2 gap-2 border-t gm-border bg-slate-50/70 p-3">
          {onEdit ? <button type="button" disabled={actionsDisabled} onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-lg border gm-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Pencil className="h-3.5 w-3.5" />Editar</button> : <span />}
          {onComplete ? <button type="button" disabled={actionsDisabled} onClick={onComplete} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />Concluir</button> : null}
        </div>
      ) : null}
    </article>
  );
}
