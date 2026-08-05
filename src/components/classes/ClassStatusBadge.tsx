export function ClassStatusBadge({ active }: { active: boolean }): JSX.Element {
  return <span className={active ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600'}>{active ? 'Ativa' : 'Inativa'}</span>;
}
