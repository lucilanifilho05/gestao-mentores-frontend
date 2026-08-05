import { useQuery } from '@tanstack/react-query';
import { reportsApi, type DashboardFilters } from '@/api/reports.api';
export function useDashboardTasks(filters: DashboardFilters) { return useQuery({ queryKey: ['dashboard', 'tarefas', filters], queryFn: () => reportsApi.tasks(filters), placeholderData: (old) => old }); }
