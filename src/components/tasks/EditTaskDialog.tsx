import { lazy, Suspense, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useActivityTypes, useTask, useUpdateTask } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/api-error";

const RichTextEditor = lazy(() => import("@/components/ui/RichTextEditor"));

export function EditTaskDialog({
  taskId,
  onClose,
  onSaved,
}: {
  taskId: string | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}): JSX.Element | null {
  const task = useTask(taskId);
  const types = useActivityTypes();
  const mutation = useUpdateTask();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [links, setLinks] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId || !task.data) return;
    setTitulo(task.data.titulo);
    setDescricao(task.data.descricao ?? "");
    setTipo(task.data.tipoAtividadeId);
    setLinks(task.data.links.join("\n"));
    setValidation(null);
    mutation.reset();
  }, [taskId, task.data]);

  if (!taskId) return null;
  const close = () => { if (!mutation.isPending) onClose(); };
  const currentType = task.data
    ? { id: task.data.tipoAtividadeId, nome: task.data.tipoAtividadeNome }
    : null;
  const availableTypes = currentType && !types.data?.data.some((item) => item.id === currentType.id)
    ? [currentType, ...(types.data?.data ?? [])]
    : (types.data?.data ?? []);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setValidation(null);
    if (!titulo.trim()) { setValidation("Informe o título da tarefa."); return; }
    if (!tipo) { setValidation("Selecione o tipo de atividade."); return; }
    const normalizedLinks = links.split(/\r?\n/).map((link) => link.trim()).filter(Boolean);
    if (normalizedLinks.length > 20) {
      setValidation("Informe no máximo 20 links.");
      return;
    }
    try {
      await mutation.mutateAsync({
        id: taskId!,
        payload: {
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          tipoAtividadeId: tipo,
          links: normalizedLinks,
        },
      });
      onSaved("Tarefa atualizada com sucesso.");
      onClose();
    } catch {
      // O erro é apresentado pela mutation.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-2 sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="gm-panel flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[calc(100vh-2rem)]" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b gm-border px-6 py-5">
          <div><p className="text-sm font-semibold gm-text-primary">Backlog</p><h2 id="edit-task-title" className="mt-1 text-xl font-bold">Editar tarefa</h2><p className="mt-2 text-sm text-slate-600">Atualize o conteúdo e adicione links aos arquivos da atividade.</p></div>
          <button type="button" aria-label="Fechar" disabled={mutation.isPending} onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {task.isLoading ? <div className="h-72 animate-pulse bg-slate-50" /> : null}
        {task.isError ? <div className="p-6"><Alert variant="error" title="Não foi possível carregar a tarefa">{getErrorMessage(task.error)}</Alert></div> : null}
        {task.data ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void submit(event)}>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {validation ? <Alert variant="error" title="Revise os dados">{validation}</Alert> : null}
              {mutation.isError ? <Alert variant="error" title="Não foi possível atualizar a tarefa">{getErrorMessage(mutation.error)}</Alert> : null}
              <label className="block"><span className="mb-2 block text-sm font-semibold">Título *</span><input className="gm-input" maxLength={200} value={titulo} onChange={(event) => setTitulo(event.target.value)} /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Tipo de atividade *</span><select className="gm-input" value={tipo} onChange={(event) => setTipo(event.target.value)}>{availableTypes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
              <div className="block"><span className="mb-2 block text-sm font-semibold">Observações</span><Suspense fallback={<div className="h-40 animate-pulse rounded-xl border gm-border bg-slate-50" />}><RichTextEditor value={descricao} onChange={setDescricao} /></Suspense></div>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Links para arquivos</span><textarea className="gm-input h-28 py-3" placeholder="Adicione um link HTTP ou HTTPS por linha" value={links} onChange={(event) => setLinks(event.target.value)} /><span className="mt-1 block text-xs text-slate-500">Máximo de 20 links. Os links existentes podem ser removidos ou substituídos.</span></label>
            </div>
            <div className="flex shrink-0 justify-end gap-3 border-t gm-border bg-slate-50/70 px-6 py-4"><Button variant="secondary" disabled={mutation.isPending} onClick={close}>Cancelar</Button><Button type="submit" isLoading={mutation.isPending}>Salvar alterações</Button></div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
