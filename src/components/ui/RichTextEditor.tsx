import { useEffect, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Eraser, Italic, List, ListOrdered } from "lucide-react";

const MAX_TEXT_LENGTH = 5000;

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
  label = "ObservaÃ§Ãµes",
}: Props): JSX.Element {
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

  return (
    <div className={`gm-rich-text ${disabled ? "opacity-60" : ""}`}>
      <div className="gm-rich-text-toolbar" role="toolbar" aria-label="FormataÃ§Ã£o das observaÃ§Ãµes">
        <ToolbarButton label="Negrito" active={editor?.isActive("bold")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="ItÃ¡lico" active={editor?.isActive("italic")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista com marcadores" active={editor?.isActive("bulletList")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista numerada" active={editor?.isActive("orderedList")} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <ToolbarButton label="Remover formataÃ§Ã£o" disabled={!editor || disabled} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-end border-t gm-border px-3 py-1.5 text-xs text-slate-500">
        {characterCount.toLocaleString("pt-BR")}/{MAX_TEXT_LENGTH.toLocaleString("pt-BR")}
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
