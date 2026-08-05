import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CursoListado } from '@/types/courses.types';
import type { TurmaStatusFiltro } from '@/types/classes.types';

interface Props { courseId: string; status: TurmaStatusFiltro; courses: CursoListado[]; loading: boolean; onCourseChange: (value: string) => void; onStatusChange: (value: TurmaStatusFiltro) => void; onSubmit: () => void; onClear: () => void }
export function ClassFilters({ courseId, status, courses, loading, onCourseChange, onStatusChange, onSubmit, onClear }: Props): JSX.Element {
  return <form className="grid gap-4 md:grid-cols-[minmax(240px,1fr)_220px_auto] md:items-end" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}><label><span className="mb-2 block text-sm font-semibold text-slate-700">Curso</span><select className="gm-input" value={courseId} onChange={(e) => onCourseChange(e.target.value)}><option value="">Todos os cursos</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.nome}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">Status</span><select className="gm-input" value={status} onChange={(e) => onStatusChange(e.target.value as TurmaStatusFiltro)}><option value="">Todos os status</option><option value="ATIVAS">Ativas</option><option value="INATIVAS">Inativas</option></select></label><div className="flex gap-2"><Button type="submit" isLoading={loading}>Filtrar</Button>{courseId || status ? <Button type="button" variant="secondary" disabled={loading} onClick={onClear}><X className="h-4 w-4" />Limpar</Button> : null}</div></form>;
}
