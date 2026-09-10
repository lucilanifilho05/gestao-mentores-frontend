import { useState } from "react";
import { Paperclip, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

const MAX_LINKS = 20;

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function linkLabel(value: string, index: number): string {
  try {
    const url = new URL(value);
    if (url.hostname === "drive.google.com") return `Google Drive ${index + 1}`;
    return `${url.hostname} ${index + 1}`;
  } catch {
    return `Arquivo ${index + 1}`;
  }
}

export function TaskLinksField({ value, onChange, disabled = false }: {
  value: string[];
  onChange: (links: string[]) => void;
  disabled?: boolean;
}): JSX.Element {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const link = draft.trim();
    if (!validHttpUrl(link)) {
      setError("Informe um link HTTP ou HTTPS válido.");
      return;
    }
    if (value.includes(link)) {
      setError("Este link já foi adicionado.");
      return;
    }
    if (value.length >= MAX_LINKS) {
      setError("O limite de 20 links foi atingido.");
      return;
    }
    onChange([...value, link]);
    setDraft("");
    setError(null);
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">Links para arquivos</span>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={`gm-input flex-1 ${error ? "gm-input-error" : ""}`}
          type="url"
          inputMode="url"
          placeholder="Cole o link do Google Drive ou de outro arquivo"
          value={draft}
          disabled={disabled || value.length >= MAX_LINKS}
          aria-invalid={Boolean(error)}
          onChange={(event) => { setDraft(event.target.value); setError(null); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="secondary" disabled={disabled || !draft.trim() || value.length >= MAX_LINKS} onClick={add}>
          <Plus className="h-4 w-4" />Adicionar
        </Button>
      </div>
      {error ? <p className="mt-1.5 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
      {value.length > 0 ? <div className="mt-3"><p className="mb-2 text-xs font-semibold text-slate-500">{value.length} {value.length === 1 ? "arquivo adicionado" : "arquivos adicionados"}</p><div className="flex flex-wrap gap-2">{value.map((link, index) => {
        const label = linkLabel(link, index);
        return <div key={link} className="inline-flex items-center overflow-hidden rounded-xl border gm-border bg-slate-50"><a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100" title={`Abrir ${label}`} aria-label={`Abrir ${label}`}><Paperclip className="h-5 w-5 gm-text-primary" /></a><button type="button" className="inline-flex h-10 w-8 items-center justify-center border-l gm-border text-slate-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-50" disabled={disabled} title={`Remover ${label}`} aria-label={`Remover ${label}`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></button></div>;
      })}</div></div> : <p className="mt-2 text-xs text-slate-500">Nenhum arquivo adicionado. Máximo de 20 links.</p>}
    </div>
  );
}
