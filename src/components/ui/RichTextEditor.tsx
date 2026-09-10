import { useEffect, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { Bold, Eraser, ImagePlus, Italic, List, ListOrdered, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

const MAX_TEXT_LENGTH = 5000;
const MAX_IMAGES = 5;

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  label = "Observações",
}: Props): JSX.Element {
  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        dropcursor: false,
        gapcursor: false,
        heading: false,
        horizontalRule: false,
        link: false,
        strike: false,
        trailingNode: false,
        underline: false,
      }),
      TiptapImage.configure({
        allowBase64: false,
        HTMLAttributes: {
          loading: "lazy",
          referrerpolicy: "no-referrer",
        },
      }),
    ],
    content: normalizeInitialContent(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "gm-rich-text-editor",
        "aria-label": label,
      },
      handleTextInput: (view, from, to, text) =>
        view.state.doc.textContent.length - (to - from) + text.length >
        MAX_TEXT_LENGTH,
      handlePaste: (view, event) => {
        const pastedText = event.clipboardData?.getData("text/plain") ?? "";
        const { from, to } = view.state.selection;
        return (
          view.state.doc.textContent.length - (to - from) + pastedText.length >
          MAX_TEXT_LENGTH
        );
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const normalizedValue = normalizeInitialContent(value);
    if (normalizedValue !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const characterCount = editor?.state.doc.textContent.length ?? 0;
  let imageCount = 0;
  editor?.state.doc.descendants((node) => {
    if (node.type.name === "image") imageCount += 1;
  });

  const closeImageForm = () => {
    setImageFormOpen(false);
    setImageUrl("");
    setImageAlt("");
    setImageError(null);
  };

  const insertImage = () => {
    const url = imageUrl.trim();
    const alt = imageAlt.trim();
    if (imageCount >= MAX_IMAGES) {
      setImageError("O limite de cinco imagens foi atingido.");
      return;
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "https:") throw new Error();
    } catch {
      setImageError("Informe uma URL HTTPS válida.");
      return;
    }
    if (!alt) {
      setImageError("Informe uma descrição para a imagem.");
      return;
    }
    editor?.chain().focus().setImage({ src: url, alt }).run();
    closeImageForm();
  };

  return (
    <div className={`gm-rich-text ${disabled ? "opacity-60" : ""}`}>
      <div className="gm-rich-text-toolbar" role="toolbar" aria-label="Formatação das observações">
        <ToolbarButton label="Negrito" active={editor?.isActive("bold")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Itálico" active={editor?.isActive("italic")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista com marcadores" active={editor?.isActive("bulletList")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista numerada" active={editor?.isActive("orderedList")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Inserir imagem por URL" disabled={!editor || disabled || imageCount >= MAX_IMAGES} onClick={() => { setImageFormOpen((open) => !open); setImageError(null); }}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <ToolbarButton label="Remover formatação" disabled={!editor || disabled} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </div>
      {imageFormOpen ? <div className="border-b gm-border bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-800">Inserir imagem</p><p className="mt-0.5 text-xs text-slate-500">Use uma imagem pública com endereço HTTPS.</p></div><button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-200" aria-label="Fechar inserção de imagem" onClick={closeImageForm}><X className="h-4 w-4" /></button></div><div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]"><label><span className="mb-1 block text-xs font-bold text-slate-600">URL da imagem</span><input className="gm-input" type="url" inputMode="url" placeholder="https://exemplo.com/imagem.jpg" value={imageUrl} onChange={(event) => { setImageUrl(event.target.value); setImageError(null); }} /></label><label><span className="mb-1 block text-xs font-bold text-slate-600">Descrição da imagem</span><input className="gm-input" maxLength={200} placeholder="Ex.: Gráfico de acompanhamento" value={imageAlt} onChange={(event) => { setImageAlt(event.target.value); setImageError(null); }} /></label><Button className="self-end" type="button" onClick={insertImage}>Inserir</Button></div>{imageError ? <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{imageError}</p> : null}</div> : null}
      <EditorContent editor={editor} />
      <div className="flex justify-end border-t gm-border px-3 py-1.5 text-xs text-slate-500">
        <span>{imageCount}/{MAX_IMAGES} imagens · {characterCount.toLocaleString("pt-BR")}/{MAX_TEXT_LENGTH.toLocaleString("pt-BR")} caracteres</span>
      </div>
    </div>
  );
}

function ToolbarButton({ label, active = false, disabled, onClick, children }: { label: string; active?: boolean; disabled: boolean; onClick: () => void; children: ReactNode }): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-2 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-blue-50 gm-text-primary" : "text-slate-600"}`}
    >
      {children}
    </button>
  );
}

function normalizeInitialContent(value: string): string {
  if (!value) return "";
  if (/<\/?(?:p|strong|em|ul|ol|li|br)\b/i.test(value)) return value;

  return `<p>${escapeHtml(value).replace(/\r?\n/g, "<br>")}</p>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
