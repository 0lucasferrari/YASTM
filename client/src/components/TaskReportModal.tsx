import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Alert,
  Paper,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { tasks as tasksApi, statuses as statusApi, users as userApi } from '../services/api.ts';
import type { Task, Status, User } from '../types/index.ts';

// ─── Helpers ────────────────────────────────────────────────────────────────

interface FlatRow {
  task: Task;
  depth: number;
}

/** Recursively collect all descendants in depth-first order */
function collectDescendantsFlat(
  taskId: string,
  allTasks: Task[],
  depth: number,
): FlatRow[] {
  const children = allTasks.filter((t) => t.parent_task_id === taskId);
  const rows: FlatRow[] = [];
  for (const child of children) {
    rows.push({ task: child, depth });
    rows.push(...collectDescendantsFlat(child.id, allTasks, depth + 1));
  }
  return rows;
}

// ─── Status colour palette ──────────────────────────────────────────────────

const STATUS_COLORS = [
  '#1976d2', // blue
  '#388e3c', // green
  '#f57c00', // orange
  '#d32f2f', // red
  '#7b1fa2', // purple
  '#0097a7', // teal
  '#c2185b', // pink
  '#455a64', // blue-grey
  '#fbc02d', // yellow
  '#5d4037', // brown
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface TaskReportModalProps {
  open: boolean;
  taskId: string | null;
  allTasks: Task[];
  onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TaskReportModal({
  open,
  taskId,
  allTasks,
  onClose,
}: TaskReportModalProps) {
  const { t } = useTranslation();

  const [rootTask, setRootTask] = useState<Task | null>(null);
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Load reference data ──────────────────────────────────────────────

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const [taskData, statusesData, usersData] = await Promise.all([
        tasksApi.get(id),
        statusApi.list(),
        userApi.list(),
      ]);
      setRootTask(taskData);
      setAllStatuses(statusesData as Status[]);
      setAllUsers(usersData as User[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('report.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open && taskId) {
      loadData(taskId);
    }
  }, [open, taskId, loadData]);

  // ─── Compute table rows ───────────────────────────────────────────────

  const flatRows: FlatRow[] = useMemo(() => {
    if (!rootTask || !taskId) return [];
    return [
      { task: rootTask, depth: 0 },
      ...collectDescendantsFlat(taskId, allTasks, 1),
    ];
  }, [rootTask, taskId, allTasks]);

  // ─── Resolve helpers ──────────────────────────────────────────────────

  const resolveStatus = (id: string) => allStatuses.find((s) => s.id === id);
  const resolveUser = (id: string) => allUsers.find((u) => u.id === id);

  // ─── Chart data ───────────────────────────────────────────────────────

  const { statusPieData, completionPercent, statusBarData, totalTasks, tasksWithStatus } = useMemo(() => {
    const statusCounts = new Map<string, number>(); // statusId → count
    let withStatus = 0;

    for (const row of flatRows) {
      if (row.task.current_status_id) {
        withStatus++;
        const count = statusCounts.get(row.task.current_status_id) ?? 0;
        statusCounts.set(row.task.current_status_id, count + 1);
      }
    }

    const total = flatRows.length;
    const noStatusCount = total - withStatus;

    // Pie chart data
    const pieData: { id: string; value: number; label: string; color: string }[] = [];
    let colorIdx = 0;
    for (const [statusId, count] of statusCounts.entries()) {
      const status = allStatuses.find((s) => s.id === statusId);
      pieData.push({
        id: statusId,
        value: count,
        label: status?.title ?? t('common.unknown'),
        color: STATUS_COLORS[colorIdx % STATUS_COLORS.length],
      });
      colorIdx++;
    }
    if (noStatusCount > 0) {
      pieData.push({
        id: 'no-status',
        value: noStatusCount,
        label: t('report.noStatus'),
        color: '#bdbdbd',
      });
    }

    // Bar chart data — status names as x-axis, count as y-axis
    const barData = pieData.map((d) => ({
      status: d.label,
      count: d.value,
    }));

    return {
      statusPieData: pieData,
      completionPercent: total > 0 ? Math.round((withStatus / total) * 100) : 0,
      statusBarData: barData,
      totalTasks: total,
      tasksWithStatus: withStatus,
    };
  }, [flatRows, allStatuses, t]);

  // ─── Export helpers ──────────────────────────────────────────────────

  const buildExportRows = () => {
    return flatRows.map((row) => {
      const indent = row.depth > 0 ? '  '.repeat(row.depth) + '↳ ' : '';
      const statusTitle = row.task.current_status_id
        ? resolveStatus(row.task.current_status_id)?.title ?? '—'
        : '—';
      const assigneeNames = (row.task.assignee_ids ?? [])
        .map((id) => resolveUser(id)?.name)
        .filter(Boolean)
        .join(', ') || '—';
      const predictedDate = row.task.predicted_finish_date
        ? new Date(row.task.predicted_finish_date).toLocaleDateString('pt-BR')
        : '—';

      return {
        title: `${indent}${row.task.title}`,
        description: row.task.description || '—',
        status: statusTitle,
        assignee: assigneeNames,
        predictedConclusion: predictedDate,
      };
    });
  };

  const handleExportPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(`${t('report.title')}: ${rootTask?.title ?? ''}`, 14, 18);
    doc.setFontSize(10);
    doc.text(
      `${t('report.tasksWithStatus')}: ${tasksWithStatus} / ${totalTasks} (${completionPercent}%)`,
      14,
      28,
    );

    const rows = buildExportRows();
    const headers = [
      t('report.colTitle'),
      t('report.colDescription'),
      t('report.colStatus'),
      t('report.colAssignee'),
      t('report.colPredictedConclusion'),
    ];

    autoTable(doc, {
      startY: 34,
      head: [headers],
      body: rows.map((r) => [r.title, r.description, r.status, r.assignee, r.predictedConclusion]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
      },
    });

    doc.save(`report-${rootTask?.title ?? 'task'}.pdf`);
  };

  const handleExportXlsx = async () => {
    const ExcelJS = (await import('exceljs')).default;

    const rows = buildExportRows();
    const headers = [
      t('report.colTitle'),
      t('report.colDescription'),
      t('report.colStatus'),
      t('report.colAssignee'),
      t('report.colPredictedConclusion'),
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(t('report.title'));
    worksheet.addRows([
      headers,
      ...rows.map((r) => [r.title, r.description, r.status, r.assignee, r.predictedConclusion]),
    ]);
    worksheet.columns = [
      { width: 40 },
      { width: 50 },
      { width: 20 },
      { width: 30 },
      { width: 20 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${rootTask?.title ?? 'task'}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenPublicReport = () => {
    if (taskId) {
      window.open(`/report/${taskId}`, '_blank');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { height: '90vh', maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('report.title')}: {rootTask?.title ?? '…'}
        </Typography>
        {rootTask && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('report.exportPdf')}>
              <IconButton size="small" onClick={handleExportPdf}>
                <PictureAsPdfIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('report.exportXlsx')}>
              <IconButton size="small" onClick={handleExportXlsx}>
                <TableChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('report.openPublicReport')}>
              <IconButton size="small" onClick={handleOpenPublicReport}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 1 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : rootTask ? (
          <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, p: 2 }}>
            {/* ═══ CHARTS SECTION ═══ */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              {/* Status Pie Chart */}
              <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('report.statusDistribution')}
                </Typography>
                {statusPieData.length > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart
                      series={[
                        {
                          data: statusPieData,
                          highlightScope: { fade: 'global', highlight: 'item' },
                          innerRadius: 40,
                          paddingAngle: 2,
                          cornerRadius: 4,
                        },
                      ]}
                      width={400}
                      height={250}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    {t('report.noData')}
                  </Typography>
                )}
              </Paper>

              {/* Overall Completion */}
              <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('report.overallCompletion')}
                </Typography>

                {/* Progress bar */}
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('report.tasksWithStatus')}: {tasksWithStatus} / {totalTasks}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {completionPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercent}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {/* Bar chart breakdown */}
                {statusBarData.length > 0 && (
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: statusBarData.map((d) => d.status) }]}
                    series={[{ data: statusBarData.map((d) => d.count), label: t('report.tasks'), color: '#1976d2' }]}
                    width={400}
                    height={200}
                  />
                )}
              </Paper>
            </Box>

            {/* ═══ TABLE SECTION ═══ */}
            <Paper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t('report.colTitle')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('report.colDescription')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('report.colStatus')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('report.colAssignee')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('report.colPredictedConclusion')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flatRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            {t('report.noData')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      flatRows.map((row) => {
                        const statusTitle = row.task.current_status_id
                          ? resolveStatus(row.task.current_status_id)?.title ?? '—'
                          : null;

                        // Resolve assignee names from the task's enriched data
                        const assigneeNames = (row.task.assignee_ids ?? [])
                          .map((id) => resolveUser(id)?.name)
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <TableRow key={row.task.id} hover>
                            {/* Title — indented by depth */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {row.depth > 0 && (
                                  <Box
                                    sx={{
                                      width: row.depth * 24,
                                      flexShrink: 0,
                                      borderLeft: '2px solid',
                                      borderColor: 'divider',
                                      ml: (row.depth - 1) * 0.5,
                                      mr: 1,
                                      height: 20,
                                    }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  fontWeight={row.depth === 0 ? 700 : 400}
                                  noWrap
                                  sx={{ maxWidth: 300 }}
                                >
                                  {row.task.title}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Description */}
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                                {row.task.description || '—'}
                              </Typography>
                            </TableCell>

                            {/* Current Status */}
                            <TableCell>
                              {statusTitle ? (
                                <Chip
                                  label={statusTitle}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">—</Typography>
                              )}
                            </TableCell>

                            {/* Assignee */}
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {assigneeNames || '—'}
                              </Typography>
                            </TableCell>

                            {/* Predicted Conclusion */}
                            <TableCell>
                              {row.task.predicted_finish_date ? (
                                <Typography variant="body2">
                                  {new Date(row.task.predicted_finish_date).toLocaleDateString('pt-BR')}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

