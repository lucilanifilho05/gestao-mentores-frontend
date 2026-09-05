import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { StatusTarefa, TarefaResumo } from "@/types/tasks.types";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const statusStyles: Record<StatusTarefa, string> = {
  planejada: "border-slate-300 bg-slate-100 text-slate-800",
  em_andamento: "border-blue-300 bg-blue-50 text-blue-800",
  atrasada: "border-red-300 bg-red-50 text-red-800",
  concluida: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

const statusLabels: Record<StatusTarefa, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  atrasada: "Atrasada",
  concluida: "Concluída",
};

function parseMonth(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function monthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function taskDateKey(value: string): string {
  return dateKey(new Date(value));
}

function time(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function monthDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const days: Date[] = [];
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }
  return days;
}

function TaskEntry({ task, showOwner, onOpen }: { task: TarefaResumo; showOwner: boolean; onOpen: (id: string) => void }): JSX.Element {
  return (
    <button
      type="button"
      className={`block w-full rounded-lg border px-2 py-1.5 text-left text-xs transition hover:brightness-95 ${statusStyles[task.status]}`}
      title={`${statusLabels[task.status]} · ${task.titulo}`}
      onClick={() => onOpen(task.id)}
    >
      <span className="font-bold">{time(task.prazoAtual)}</span>
      <span className="ml-1 font-semibold">#{task.numero}</span>
      <span className="mt-0.5 block truncate font-semibold">{task.titulo}</span>
      {showOwner ? <span className="mt-0.5 block truncate opacity-75">{task.responsavel.nome}</span> : null}
    </button>
  );
}

export function TaskCalendar({ month, tasks, showOwner, onMonthChange, onOpen }: {
  month: string;
  tasks: TarefaResumo[];
  showOwner: boolean;
  onMonthChange: (month: string) => void;
  onOpen: (id: string) => void;
}): JSX.Element {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());
  const selectedMonth = parseMonth(month);
  const days = monthDays(selectedMonth);
  const today = dateKey(new Date());
  const tasksByDay = new Map<string, TarefaResumo[]>();

  tasks.forEach((task) => {
    const key = taskDateKey(task.prazoAtual);
    const current = tasksByDay.get(key) ?? [];
    current.push(task);
    tasksByDay.set(key, current);
  });

  const changeMonth = (offset: number) => {
    onMonthChange(monthValue(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + offset, 1)));
  };
  const activeDays = days.filter((day) => day.getMonth() === selectedMonth.getMonth() && (tasksByDay.get(dateKey(day))?.length ?? 0) > 0);

  return (
    <section className="gm-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b gm-border px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-lg font-bold capitalize text-slate-950">
            {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(selectedMonth)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">Atividades organizadas pelo prazo programado</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" onClick={() => onMonthChange(monthValue(new Date()))}>Hoje</Button>
          <Button variant="secondary" onClick={() => changeMonth(1)} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
          <input className="gm-input w-36" type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} aria-label="Selecionar mês" />
        </div>
      </div>

      <div className="hidden grid-cols-7 border-b gm-border bg-slate-50 md:grid">
        {WEEK_DAYS.map((day) => <div key={day} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">{day}</div>)}
      </div>
      <div className="hidden grid-cols-7 md:grid">
        {days.map((day) => {
          const key = dateKey(day);
          const dayTasks = tasksByDay.get(key) ?? [];
          const belongsToMonth = day.getMonth() === selectedMonth.getMonth();
          const expanded = expandedDays.has(key);
          return (
            <div key={key} className={`min-h-36 border-b border-r gm-border p-2 ${belongsToMonth ? "bg-white" : "bg-slate-50/70"}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${key === today ? "bg-blue-700 text-white" : belongsToMonth ? "text-slate-700" : "text-slate-400"}`}>{day.getDate()}</span>
              <div className="mt-2 space-y-1.5">
                {dayTasks.slice(0, expanded ? undefined : 3).map((task) => <TaskEntry key={task.id} task={task} showOwner={showOwner} onOpen={onOpen} />)}
                {dayTasks.length > 3 ? <button type="button" className="px-1 text-xs font-bold text-blue-700 hover:underline" onClick={() => setExpandedDays((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; })}>{expanded ? "Mostrar menos" : `+${dayTasks.length - 3} atividades`}</button> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="divide-y gm-border md:hidden">
        {activeDays.map((day) => {
          const key = dateKey(day);
          return <div key={key} className="p-4"><p className="mb-3 text-sm font-bold capitalize text-slate-700">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(day)}</p><div className="space-y-2">{(tasksByDay.get(key) ?? []).map((task) => <TaskEntry key={task.id} task={task} showOwner={showOwner} onOpen={onOpen} />)}</div></div>;
        })}
        {activeDays.length === 0 ? <div className="px-6 py-14 text-center text-sm text-slate-500">Nenhuma atividade programada neste mês.</div> : null}
      </div>

      <div className="flex flex-wrap gap-3 border-t gm-border bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">
        {(Object.keys(statusLabels) as StatusTarefa[]).map((status) => <span key={status} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full border ${statusStyles[status]}`} />{statusLabels[status]}</span>)}
      </div>
    </section>
  );
}
