import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { StatusTarefa, TarefaResumo } from "@/types/tasks.types";

const statusLabels: Record<StatusTarefa, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  atrasada: "Atrasada",
  concluida: "Concluída",
};

interface Props {
  id: string;
  task: TarefaResumo;
  anchor: DOMRect;
  showOwner: boolean;
  onDismiss: () => void;
}

export function TaskCalendarPreview({ id, task, anchor, showOwner, onDismiss }: Props): JSX.Element {
  useEffect(() => {
    const dismiss = () => onDismiss();
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", dismissOnEscape);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", dismissOnEscape);
    };
  }, [onDismiss]);

  const viewportMargin = 12;
  const gap = 8;
  const width = Math.min(320, Math.max(0, window.innerWidth - viewportMargin * 2));
  const left = Math.min(Math.max(viewportMargin, anchor.left), window.innerWidth - width - viewportMargin);
  const spaceBelow = window.innerHeight - anchor.bottom;
  const placeAbove = spaceBelow < 300 && anchor.top > spaceBelow;
  const availableHeight = Math.max(
    0,
    (placeAbove ? anchor.top : spaceBelow) - gap - viewportMargin,
  );
  const description = plainText(task.descricao);
  const context = task.escopo === "evento_macro"
    ? "Evento macro"
    : [task.cursoNome, task.turmaCodigo].filter(Boolean).join(" · ");

  return createPortal(
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none fixed z-[70] max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl"
      style={{
        width,
        left,
        maxHeight: availableHeight,
        ...(placeAbove
          ? { bottom: Math.max(viewportMargin, window.innerHeight - anchor.top + gap) }
          : { top: anchor.bottom + gap }),
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-bold leading-5 text-slate-950">{task.titulo}</p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">#{task.numero}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-blue-700">{statusLabels[task.status]} · {task.tipoAtividadeNome}</p>
      {task.tipoVinculo === "apoio" ? (
        <p className="mt-2 rounded-lg bg-violet-50 px-2.5 py-2 text-xs font-semibold text-violet-800">
          Você foi marcado como apoio nesta atividade. A tarefa é somente para consulta.
        </p>
      ) : null}
      <dl className="mt-3 grid gap-1.5 text-xs text-slate-600">
        <div><dt className="inline font-bold text-slate-700">Projeto: </dt><dd className="inline">{task.projetoNome}</dd></div>
        {showOwner ? <div><dt className="inline font-bold text-slate-700">Responsável: </dt><dd className="inline">{task.responsavel.nome}</dd></div> : null}
        {!showOwner && task.tipoVinculo === "apoio" ? <div><dt className="inline font-bold text-slate-700">Responsável: </dt><dd className="inline">{task.responsavel.nome}</dd></div> : null}
        {task.participantes.length > 0 ? <div><dt className="inline font-bold text-slate-700">Apoio: </dt><dd className="inline">{task.participantes.map((mentor) => mentor.nome).join(", ")}</dd></div> : null}
        {context ? <div><dt className="inline font-bold text-slate-700">Contexto: </dt><dd className="inline">{context}</dd></div> : null}
        <div><dt className="inline font-bold text-slate-700">Prazo: </dt><dd className="inline">{formatDeadline(task.prazoAtual)}</dd></div>
      </dl>
      {description ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-bold text-slate-700">Observações</p>
          <p className="mt-1 max-h-16 overflow-hidden text-xs leading-5 text-slate-600">{description}</p>
        </div>
      ) : null}
      <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">Clique para visualizar todos os detalhes</p>
    </div>,
    document.body,
  );
}

function plainText(value: string | null): string {
  if (!value) return "";
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return (parsed.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function formatDeadline(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
