import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { tasks, statuses as statusApi } from '../services/api.ts';
import type { Task, Status } from '../types/index.ts';
import TaskDetailModal, { buildSubtaskCountMap } from '../components/TaskDetailModal.tsx';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const priorityColor: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
};

export default function TasksPage() {
  const { t } = useTranslation();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Detail modal
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const load = useCallback(async () => {
    try {
      const [data, statusData] = await Promise.all([
        tasks.list(),
        statusApi.list(),
      ]);
      setAllTasks(data);
      setAllStatuses(statusData as Status[]);
    } catch {
      setError(t('tasks.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  // Only show root tasks (no parent) in the main table
  const rootTasks = allTasks.filter((t) => !t.parent_task_id);
  const subtaskCountMap = buildSubtaskCountMap(allTasks);

  const resolveStatus = (id: string) => allStatuses.find((s) => s.id === id);

  const openCreate = () => {
    setTitle('');
    setDescription('');
    setPriority('');
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await tasks.create({
        title,
        description: description || undefined,
        priority: priority || undefined,
      });
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.saveFailed'));
    }
  };

  const openDetail = (taskId: string) => {
    setDetailTaskId(taskId);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailTaskId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('tasks.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('tasks.newTask')}
        </Button>
      </Box>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.title')}</TableCell>
                  <TableCell>{t('tasks.status')}</TableCell>
                  <TableCell>{t('tasks.priority')}</TableCell>
                  <TableCell>{t('tasks.subtasks')}</TableCell>
                  <TableCell>{t('common.created')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rootTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {t('tasks.emptyState')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rootTasks.map((item) => {
                    const totalDescendants = subtaskCountMap.get(item.id) ?? 0;
                    const statusTitle = item.current_status_id
                      ? resolveStatus(item.current_status_id)?.title ?? '—'
                      : null;

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => openDetail(item.id)}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>{item.title}</Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
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
                        <TableCell>
                          {item.priority ? (
                            <Chip
                              label={t(`priority.${item.priority}`)}
                              size="small"
                              color={priorityColor[item.priority] ?? 'default'}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {totalDescendants > 0 ? (
                            <Tooltip title={t('tasks.subtasksCount', { count: totalDescendants })}>
                              <Chip
                                icon={<AccountTreeIcon />}
                                label={totalDescendants}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('tasks.newTask')}</DialogTitle>
        <DialogContent>
          {error && dialogOpen && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label={t('common.title')}
            fullWidth
            required
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <TextField
            label={t('common.description')}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label={t('tasks.priority')}
            select
            fullWidth
            margin="normal"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="">{t('common.noneF')}</MenuItem>
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>{t(`priority.${p}`)}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={detailOpen}
        taskId={detailTaskId}
        allTasks={allTasks}
        onClose={handleDetailClose}
        onTasksChanged={load}
      />
    </Box>
  );
}
