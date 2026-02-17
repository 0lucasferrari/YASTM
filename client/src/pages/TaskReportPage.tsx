import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Paper,
  LinearProgress,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { reports, type TaskReportData } from '../services/api.ts';
import type { Task } from '../types/index.ts';

// ─── Helpers ────────────────────────────────────────────────────────────────

interface FlatRow {
  task: Task;
  depth: number;
}

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
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#7b1fa2',
  '#0097a7',
  '#c2185b',
  '#455a64',
  '#fbc02d',
  '#5d4037',
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function TaskReportPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { t } = useTranslation();
  const tableRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<TaskReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const reportData = await reports.getTaskReport(id);
      setData(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('report.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (taskId) {
      loadReport(taskId);
    }
  }, [taskId, loadReport]);

  // ─── Compute table rows ─────────────────────────────────────────────

  const flatRows: FlatRow[] = useMemo(() => {
    if (!data?.rootTask || !taskId) return [];
    return [
      { task: data.rootTask, depth: 0 },
      ...collectDescendantsFlat(taskId, data.allTasks, 1),
    ];
  }, [data, taskId]);

  // ─── Resolve helpers ────────────────────────────────────────────────

  const resolveStatus = (id: string) => data?.statuses.find((s) => s.id === id);
  const resolveUser = (id: string) => data?.users.find((u) => u.id === id);

  // ─── Chart data ─────────────────────────────────────────────────────

  const { statusPieData, completionPercent, statusBarData, totalTasks, tasksWithStatus } = useMemo(() => {
    const statusCounts = new Map<string, number>();
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

    const pieData: { id: string; value: number; label: string; color: string }[] = [];
    let colorIdx = 0;
    for (const [statusId, count] of statusCounts.entries()) {
      const status = data?.statuses.find((s) => s.id === statusId);
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
  }, [flatRows, data, t]);

  // ─── Export helpers ─────────────────────────────────────────────────

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

    // Title
    doc.setFontSize(16);
    doc.text(`${t('report.title')}: ${data?.rootTask.title ?? ''}`, 14, 18);

    // Summary
    doc.setFontSize(10);
    doc.text(
      `${t('report.tasksWithStatus')}: ${tasksWithStatus} / ${totalTasks} (${completionPercent}%)`,
      14,
      28,
    );

    // Table
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

    doc.save(`report-${data?.rootTask.title ?? 'task'}.pdf`);
  };

  const handleExportXlsx = async () => {
    const XLSX = await import('xlsx');

    const rows = buildExportRows();
    const headers = [
      t('report.colTitle'),
      t('report.colDescription'),
      t('report.colStatus'),
      t('report.colAssignee'),
      t('report.colPredictedConclusion'),
    ];

    const wsData = [
      headers,
      ...rows.map((r) => [r.title, r.description, r.status, r.assignee, r.predictedConclusion]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 },
      { wch: 50 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('report.title'));
    XLSX.writeFile(wb, `report-${data?.rootTask.title ?? 'task'}.xlsx`);
  };

  // ─── Render ─────────────────────────────────────────────────────────

  if (!taskId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{t('report.noTaskId')}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('report.title')}: {data?.rootTask.title ?? '…'}
          </Typography>
          {data && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPdf}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TableChartIcon />}
                onClick={handleExportXlsx}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
              >
                XLSX
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <>
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
            <Paper variant="outlined" ref={tableRef}>
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

                        const assigneeNames = (row.task.assignee_ids ?? [])
                          .map((id) => resolveUser(id)?.name)
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <TableRow key={row.task.id} hover>
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
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                                {row.task.description || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {statusTitle ? (
                                <Chip label={statusTitle} size="small" variant="outlined" color="primary" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {assigneeNames || '—'}
                              </Typography>
                            </TableCell>
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
          </>
        ) : null}
      </Container>
    </Box>
  );
}

