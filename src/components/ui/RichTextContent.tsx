export function RichTextContent({ html }: { html: string }): JSX.Element {
  return (
    <div
      className="gm-rich-text-content mt-2 text-sm leading-6 text-slate-600"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
