import { useState } from "react";
import { CalendarClock, CheckCircle2, ExternalLink, Link, X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { RichTextContent } from "@/components/ui/RichTextContent";
import { useCompleteTask, useRescheduleTask, useTask } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/api-error";

export function TaskDetailDialog({ taskId, onClose, onChanged }: { taskId: string | null; onClose: () => void; onChanged: (message: string) => void }): JSX.Element | null {
  const task = useTask(taskId);
  const complete = useCompleteTask();
  const reschedule = useRescheduleTask();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const data = task.data;
  if (!taskId) return null;
  const format = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="gm-panel w-full max-w-3xl overflow-hidden" role="dialog" aria-modal="true">
      <div className="flex justify-between border-b gm-border px-6 py-5"><div><p className="text-sm font-semibold gm-text-primary">Detalhes da tarefa</p><h2 className="mt-1 text-xl font-bold text-slate-950">{data?.titulo ?? "Carregando…"}</h2></div><button type="button" aria-label="Fechar" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      {task.isLoading ? <div className="h-72 animate-pulse bg-slate-50" /> : null}
      {task.isError ? <div className="p-6"><Alert variant="error" title="Não foi possível carregar a tarefa">{getErrorMessage(task.error)}</Alert></div> : null}
      {data ? <div className="max-h-[75vh] overflow-y-auto"><div className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Projeto" value={data.projetoNome} /><Info label="Responsável" value={data.responsavel.nome} /><Info label="Contexto" value={data.turmaCodigo ?? data.cursoNome ?? "Evento macro"} /><Info label="Prazo" value={format(data.prazoAtual)} /></div>
        {data.descricao ? <div><h3 className="text-sm font-bold">Observações</h3><RichTextContent html={data.descricao} /></div> : null}
        {complete.isError || reschedule.isError ? <Alert variant="error" title="Não foi possível executar a operação">{getErrorMessage(complete.error ?? reschedule.error)}</Alert> : null}
        {data.status === "pendente" ? <div className="rounded-xl border gm-border p-4"><h3 className="font-bold">Reagendar</h3><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input className="gm-input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /><input className="gm-input" placeholder="Justificativa (opcional)" maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} /><Button variant="secondary" disabled={!date} isLoading={reschedule.isPending} onClick={async () => { await reschedule.mutateAsync({ id: data.id, prazoNovo: new Date(date).toISOString(), justificativa: reason }); await task.refetch(); setDate(""); setReason(""); onChanged("Tarefa reagendada com sucesso."); }}><CalendarClock className="h-4 w-4" />Reagendar</Button></div></div> : null}
        <div><h3 className="font-bold">Links para arquivos</h3><div className="mt-3 space-y-2">{data.links.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"><span className="inline-flex items-center gap-2"><Link className="h-4 w-4" />Link {index + 1}</span><ExternalLink className="h-4 w-4" /></a>)}{data.links.length === 0 ? <p className="text-sm text-slate-500">Nenhum link informado.</p> : null}</div></div>
        {data.reagendamentos.length > 0 ? <div><h3 className="font-bold">Histórico de prazos</h3><div className="mt-3 space-y-2">{data.reagendamentos.map((item) => <div key={item.id} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><strong>{format(item.prazoAnterior)}</strong> → <strong>{format(item.prazoNovo)}</strong>{item.justificativa ? <p className="mt-1">{item.justificativa}</p> : null}</div>)}</div></div> : null}
      </div><div className="flex justify-end gap-3 border-t gm-border bg-slate-50/70 px-6 py-4"><Button variant="secondary" onClick={onClose}>Fechar</Button>{data.status === "pendente" ? <Button isLoading={complete.isPending} onClick={async () => { await complete.mutateAsync(data.id); onChanged("Tarefa concluída com sucesso."); onClose(); }}><CheckCircle2 className="h-4 w-4" />Concluir tarefa</Button> : null}</div></div> : null}
    </div>
  </div>;
}

function Info({ label, value }: { label: string; value: string }): JSX.Element {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
