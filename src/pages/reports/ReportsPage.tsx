import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FilterX,
  ListFilter,
} from "lucide-react";

import { reportsApi, type DashboardFilters } from "@/api/reports.api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { useActivityTypes } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { getErrorMessage } from "@/utils/api-error";

const PAGE_SIZE = 25;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function scopeLabel(scope: string): string {
  if (scope === "evento_macro") return "Evento macro";
  return scope === "turma" ? "Turma" : "Curso";
}

function statusLabel(status: string): string {
  if (status === "planejada") return "Planejada";
  if (status === "em_andamento") return "Em andamento";
  if (status === "atrasada") return "Atrasada";
  return "Concluída";
}

function statusClass(status: string): string {
  if (status === "concluida") {
    return "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700";
  }
  if (status === "atrasada") {
    return "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700";
  }
  if (status === "em_andamento") {
    return "inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700";
  }
  return "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ReportsPage(): JSX.Element {
  const { user } = useAuth();
  const coordinator = user?.papel === "COORDENADORA";
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [tipoAtividadeId, setTipoAtividadeId] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [exportError, setExportError] = useState<unknown>(null);

  const filters = useMemo<DashboardFilters>(
    () => ({
      inicio: inicio || undefined,
      fim: fim || undefined,
      mentorId: coordinator ? mentorId || undefined : undefined,
      cursoId: cursoId || undefined,
      turmaId: turmaId || undefined,
      tipoAtividadeId: tipoAtividadeId || undefined,
    }),
    [coordinator, cursoId, fim, inicio, mentorId, tipoAtividadeId, turmaId],
  );

  const report = useDashboardTasks(filters);
  const courses = useCourses({
    pagina: 1,
    limite: 100,
    apenas_meus: user?.papel === "MENTOR" ? true : undefined,
  });
  const classes = useClasses({ pagina: 1, limite: 100, cursoId: cursoId || undefined });
  const mentors = useUsers({ pagina: 1, limite: 100, papel: "MENTOR", ativo: true });
  const activityTypes = useActivityTypes(false);

  const tasks = report.data ?? [];
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const visibleTasks = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(inicio || fim || mentorId || cursoId || turmaId || tipoAtividadeId);

  useEffect(() => setPage(1), [filters]);

  function clearFilters(): void {
    setInicio("");
    setFim("");
    setMentorId("");
    setCursoId("");
    setTurmaId("");
    setTipoAtividadeId("");
  }

  async function exportReport(format: "excel" | "pdf"): Promise<void> {
    setExporting(format);
    setExportError(null);
    try {
      const blob = format === "excel" ? await reportsApi.excel(filters) : await reportsApi.pdf(filters);
      downloadBlob(blob, `relatorio_tarefas.${format === "excel" ? "xlsx" : "pdf"}`);
    } catch (error: unknown) {
      setExportError(error);
    } finally {
      setExporting(null);
    }
  }

  if (!user) return <></>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="gm-eyebrow">Análise operacional</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Relatório de tarefas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte as tarefas por período e contexto ou exporte o resultado completo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" isLoading={exporting === "excel"} disabled={report.isLoading || exporting !== null} onClick={() => void exportReport("excel")}>
            <FileSpreadsheet className="h-4 w-4" />Exportar Excel
          </Button>
          <Button variant="secondary" isLoading={exporting === "pdf"} disabled={report.isLoading || exporting !== null} onClick={() => void exportReport("pdf")}>
            <FileText className="h-4 w-4" />Exportar PDF
          </Button>
        </div>
      </section>

      <section className="gm-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b gm-border pb-4">
          <ListFilter className="h-5 w-5 gm-text-primary" />
          <div><h3 className="font-bold text-slate-950">Filtros</h3><p className="text-sm text-slate-500">Os mesmos filtros são aplicados à tabela e aos arquivos.</p></div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">De</span><input className="gm-input" type="date" value={inicio} max={fim || undefined} onChange={(event) => setInicio(event.target.value)} /></label>
          <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Até</span><input className="gm-input" type="date" value={fim} min={inicio || undefined} onChange={(event) => setFim(event.target.value)} /></label>
          {coordinator ? <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Mentor</span><select className="gm-input" value={mentorId} onChange={(event) => setMentorId(event.target.value)}><option value="">Todos</option>{mentors.data?.data.map((mentor) => <option key={mentor.id} value={mentor.id}>{mentor.nome}</option>)}</select></label> : null}
          <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Curso</span><select className="gm-input" value={cursoId} onChange={(event) => { setCursoId(event.target.value); setTurmaId(""); }}><option value="">Todos</option>{courses.data?.data.map((course) => <option key={course.id} value={course.id}>{course.nome}</option>)}</select></label>
          <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Turma</span><select className="gm-input" value={turmaId} onChange={(event) => setTurmaId(event.target.value)}><option value="">Todas</option>{classes.data?.data.map((item) => <option key={item.id} value={item.id}>{item.codigo}</option>)}</select></label>
          <label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Tipo de atividade</span><select className="gm-input" value={tipoAtividadeId} onChange={(event) => setTipoAtividadeId(event.target.value)}><option value="">Todos</option>{activityTypes.data?.data.map((type) => <option key={type.id} value={type.id}>{type.nome}{type.ativo ? "" : " (inativo)"}</option>)}</select></label>
        </div>
        {hasFilters ? <Button className="mt-4" variant="ghost" onClick={clearFilters}><FilterX className="h-4 w-4" />Limpar filtros</Button> : null}
      </section>

      {report.isError ? <Alert variant="error" title="Não foi possível carregar o relatório">{getErrorMessage(report.error)}</Alert> : null}
      {exportError ? <Alert variant="error" title="Não foi possível exportar o relatório">{getErrorMessage(exportError)}</Alert> : null}

      <section className="gm-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b gm-border px-5 py-4 sm:px-6">
          <div><h3 className="font-bold text-slate-950">Resultados</h3><p className="mt-1 text-sm text-slate-500">{report.isFetching ? "Atualizando…" : `${tasks.length} tarefa${tasks.length === 1 ? "" : "s"} encontrada${tasks.length === 1 ? "" : "s"}`}</p></div>
          <Download className="h-5 w-5 text-slate-400" />
        </div>
        {report.isLoading ? <div className="h-80 animate-pulse bg-slate-50" aria-label="Carregando relatório" /> : null}
        {!report.isLoading && !report.isError && tasks.length === 0 ? <EmptyState icon={<FileText className="h-7 w-7" />} title="Nenhuma tarefa encontrada" description="Altere os filtros para ampliar o resultado do relatório." /> : null}
        {visibleTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y gm-border text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Tarefa</th><th className="px-5 py-3 font-bold">Tipo</th><th className="px-5 py-3 font-bold">Responsável</th><th className="px-5 py-3 font-bold">Contexto</th><th className="px-5 py-3 font-bold">Prazo</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 text-center font-bold">Reag.</th>
                </tr>
              </thead>
              <tbody className="divide-y gm-border bg-white">
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="align-top hover:bg-slate-50/70">
                    <td className="min-w-64 px-5 py-4"><p className="font-semibold text-slate-950">{task.titulo}</p><p className="mt-1 text-xs text-slate-500">{task.projeto.nome}</p></td>
                    <td className="px-5 py-4 text-slate-700">{task.tipoAtividade.nome}</td>
                    <td className="px-5 py-4"><p className="font-medium text-slate-800">{task.responsavel.nome}</p><p className="mt-1 text-xs text-slate-500">{task.responsavel.email}</p></td>
                    <td className="px-5 py-4"><p className="text-slate-700">{task.turma?.codigo ?? task.curso?.nome ?? scopeLabel(task.escopo)}</p><p className="mt-1 text-xs text-slate-500">{scopeLabel(task.escopo)}</p></td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatDate(task.prazoAtual)}</td>
                    <td className="px-5 py-4"><span className={statusClass(task.status)}>{statusLabel(task.status)}</span></td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-700">{task.quantidadeReagendamentos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <Pagination page={page} totalPages={totalPages} disabled={report.isFetching} onPageChange={setPage} />
      </section>
    </div>
  );
}
