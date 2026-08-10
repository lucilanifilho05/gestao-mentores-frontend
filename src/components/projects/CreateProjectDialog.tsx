import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useCreateProject } from "@/hooks/useProjects";
import { getErrorMessage } from "@/utils/api-error";

export function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}): JSX.Element | null {
  const mutation = useCreateProject();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setNome("");
      setDescricao("");
      setInicio("");
      setPrazo("");
      setValidation(null);
      mutation.reset();
    }
  }, [open]);
  if (!open) return null;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setValidation(null);
    if (!nome.trim() || !prazo) {
      setValidation("Preencha os campos obrigatórios.");
      return;
    }
    if (inicio && prazo < inicio) {
      setValidation("O prazo final não pode ser anterior ao início.");
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        dataInicio: inicio ? new Date(inicio).toISOString() : undefined,
        prazoFinal: new Date(prazo).toISOString(),
      });
      onCreated(result.nome);
    } catch {
      /* mutation */
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !mutation.isPending) onClose();
      }}
    >
      <div className="gm-panel w-full max-w-2xl">
        <div className="flex justify-between border-b gm-border px-6 py-5">
          <div>
            <p className="text-sm font-semibold gm-text-primary">Agrupamento</p>
            <h2 className="text-xl font-bold">Novo projeto</h2>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => void submit(e)}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {validation ? (
              <div className="sm:col-span-2">
                <Alert variant="error" title="Revise os dados">
                  {validation}
                </Alert>
              </div>
            ) : null}
            {mutation.isError ? (
              <div className="sm:col-span-2">
                <Alert variant="error" title="Não foi possível criar">
                  {getErrorMessage(mutation.error)}
                </Alert>
              </div>
            ) : null}
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Nome *</span>
              <input
                className="gm-input"
                maxLength={200}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Início</span>
              <input
                className="gm-input"
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
                className="gm-input"
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
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t gm-border p-4">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Criar projeto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
