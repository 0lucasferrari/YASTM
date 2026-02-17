import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  Breadcrumbs,
  Link,
  Badge,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import SendIcon from '@mui/icons-material/Send';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { tasks, statuses as statusApi, labels as labelApi, users as userApi } from '../services/api.ts';
import type { Task, Comment, Status, Label, User } from '../types/index.ts';
import TaskReportModal from './TaskReportModal.tsx';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a map of taskId → count of ALL descendants (recursive) */
function buildSubtaskCountMap(allTasks: Task[]): Map<string, number> {
  const childrenMap = new Map<string, string[]>();
  for (const t of allTasks) {
    if (t.parent_task_id) {
      const existing = childrenMap.get(t.parent_task_id) ?? [];
      existing.push(t.id);
      childrenMap.set(t.parent_task_id, existing);
    }
  }

  const cache = new Map<string, number>();

  function countDescendants(id: string): number {
    if (cache.has(id)) return cache.get(id)!;
    const children = childrenMap.get(id) ?? [];
    let count = children.length;
    for (const childId of children) {
      count += countDescendants(childId);
    }
    cache.set(id, count);
    return count;
  }

  for (const t of allTasks) {
    countDescendants(t.id);
  }

  return cache;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const priorityColor: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface TaskDetailModalProps {
  open: boolean;
  taskId: string | null;
  allTasks: Task[];
  onClose: () => void;
  onTasksChanged: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TaskDetailModal({
  open,
  taskId,
  allTasks,
  onClose,
  onTasksChanged,
}: TaskDetailModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ─── Core state ────────────────────────────────────────────────────────
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reference data
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Mode: 'view' or 'edit'
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [editPossibleStatusIds, setEditPossibleStatusIds] = useState<string[]>([]);
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
  const [editParentTaskId, setEditParentTaskId] = useState<string | null>(null);
  const [editPredictedFinishDate, setEditPredictedFinishDate] = useState<string>('');

  // Subtask creation
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Comment creation
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Clone confirmation dialog
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);

  // Breadcrumb trail
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; title: string }[]>([]);

  const subtaskCountMap = buildSubtaskCountMap(allTasks);

  // ─── Data loading ──────────────────────────────────────────────────────

  const loadTaskData = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const [taskData, commentsData, statusesData, labelsData, usersData] = await Promise.all([
        tasks.get(id),
        tasks.listComments(id),
        statusApi.list(),
        labelApi.list(),
        userApi.list(),
      ]);
      setTask(taskData);
      setCommentsList(commentsData);
      setAllStatuses(statusesData as Status[]);
      setAllLabels(labelsData as Label[]);
      setAllUsers(usersData as User[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // When modal opens or taskId changes, reset state
  useEffect(() => {
    if (open && taskId) {
      setCurrentTaskId(taskId);
      const t = allTasks.find((t) => t.id === taskId);
      setBreadcrumb(t ? [{ id: t.id, title: t.title }] : []);
      loadTaskData(taskId);
      setMode('view');
      setShowSubtaskForm(false);
      setNewSubtaskTitle('');
      setNewComment('');
    }
  }, [open, taskId, loadTaskData, allTasks]);

  // Populate edit form when switching to edit mode or when task changes
  useEffect(() => {
    if (task && mode === 'edit') {
      setEditTitle(task.title);
      setEditDescription(task.description ?? '');
      setEditPriority(task.priority ?? '');
      setEditPossibleStatusIds(task.possible_status_ids ?? []);
      setEditAssigneeIds(task.assignee_ids ?? []);
      setEditParentTaskId(task.parent_task_id);
      setEditPredictedFinishDate(
        task.predicted_finish_date
          ? new Date(task.predicted_finish_date).toISOString().slice(0, 10)
          : '',
      );
    }
  }, [task, mode]);

  // ─── Navigation ────────────────────────────────────────────────────────

  const navigateToSubtask = (subtask: Task) => {
    setCurrentTaskId(subtask.id);
    setBreadcrumb((prev) => [...prev, { id: subtask.id, title: subtask.title }]);
    loadTaskData(subtask.id);
    setMode('view');
    setShowSubtaskForm(false);
    setNewSubtaskTitle('');
    setNewComment('');
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumb[index];
    setCurrentTaskId(target.id);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
    loadTaskData(target.id);
    setMode('view');
    setShowSubtaskForm(false);
    setNewSubtaskTitle('');
    setNewComment('');
  };

  // Direct subtasks of current task
  const directSubtasks = allTasks.filter((t) => t.parent_task_id === currentTaskId);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim() || !currentTaskId) return;
    try {
      await tasks.create({ title: newSubtaskTitle, parent_task_id: currentTaskId });
      setNewSubtaskTitle('');
      setShowSubtaskForm(false);
      onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.createSubtaskFailed'));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentTaskId) return;
    setSendingComment(true);
    try {
      const created = await tasks.addComment(currentTaskId, newComment);
      setCommentsList((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.addCommentFailed'));
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusChange = async (statusId: string) => {
    if (!currentTaskId) return;
    try {
      const updated = await tasks.setCurrentStatus(currentTaskId, statusId);
      setTask(updated);
      onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.changeStatusFailed'));
    }
  };

  // ─── Edit mode handlers ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!currentTaskId || !task) return;
    try {
      // 1) Save basic task fields (including parent_task_id)
      const updated = await tasks.update(currentTaskId, {
        title: editTitle,
        description: editDescription || null,
        priority: editPriority || null,
        parent_task_id: editParentTaskId,
        predicted_finish_date: editPredictedFinishDate
          ? new Date(editPredictedFinishDate).toISOString()
          : null,
      });
      setTask(updated);

      // 2) Sync possible statuses — compute diff
      const currentStatusIds = task.possible_status_ids ?? [];
      const statusesToAdd = editPossibleStatusIds.filter((id) => !currentStatusIds.includes(id));
      const statusesToRemove = currentStatusIds.filter((id) => !editPossibleStatusIds.includes(id));

      for (const statusId of statusesToAdd) {
        await tasks.addStatus(currentTaskId, statusId);
      }
      for (const statusId of statusesToRemove) {
        await tasks.removeStatus(currentTaskId, statusId);
      }

      // 3) Sync assignees — compute diff
      const currentAssigneeIds = task.assignee_ids ?? [];
      const assigneesToAdd = editAssigneeIds.filter((id) => !currentAssigneeIds.includes(id));
      const assigneesToRemove = currentAssigneeIds.filter((id) => !editAssigneeIds.includes(id));

      for (const userId of assigneesToAdd) {
        await tasks.addAssignee(currentTaskId, userId);
      }
      for (const userId of assigneesToRemove) {
        await tasks.removeAssignee(currentTaskId, userId);
      }

      // 4) Reload task data to reflect changes
      await loadTaskData(currentTaskId);
      onTasksChanged();

      // Update breadcrumb if title changed
      if (editTitle !== task.title) {
        setBreadcrumb((prev) =>
          prev.map((crumb) =>
            crumb.id === currentTaskId ? { ...crumb, title: editTitle } : crumb,
          ),
        );
      }

      setMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.saveChangesFailed'));
    }
  };

  const handleCancelEdit = () => {
    setMode('view');
  };

  const handleClone = async (asSubtask: boolean) => {
    if (!currentTaskId) return;
    try {
      const cloned = await tasks.clone(currentTaskId);
      if (asSubtask) {
        await tasks.update(cloned.id, { parent_task_id: currentTaskId });
      }
      onTasksChanged();
      setCloneDialogOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.cloneFailed'));
      setCloneDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTaskId) return;
    try {
      await tasks.remove(currentTaskId);
      setDeleteDialogOpen(false);
      onTasksChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('taskDetail.deleteFailed'));
      setDeleteDialogOpen(false);
    }
  };

  // ─── Resolve helpers ───────────────────────────────────────────────────

  const resolveStatus = (id: string) => allStatuses.find((s) => s.id === id);
  const resolveUser = (id: string) => allUsers.find((u) => u.id === id);
  const resolveLabel = (id: string) => allLabels.find((l) => l.id === id);

  const currentStatusTitle = task?.current_status_id
    ? resolveStatus(task.current_status_id)?.title ?? '—'
    : t('taskDetail.noStatus');

  const possibleStatuses = (task?.possible_status_ids ?? [])
    .map(resolveStatus)
    .filter((s): s is Status => !!s);

  const assignees = (task?.assignee_ids ?? [])
    .map(resolveUser)
    .filter((u): u is User => !!u);

  const taskLabels = (task?.label_ids ?? [])
    .map(resolveLabel)
    .filter((l): l is Label => !!l);

  // Build set of descendant IDs (to prevent circular parent assignment)
  const getDescendantIds = (taskId: string): Set<string> => {
    const ids = new Set<string>();
    const stack = [taskId];
    while (stack.length > 0) {
      const id = stack.pop()!;
      for (const t of allTasks) {
        if (t.parent_task_id === id && !ids.has(t.id)) {
          ids.add(t.id);
          stack.push(t.id);
        }
      }
    }
    return ids;
  };

  const parentTaskCandidates = currentTaskId
    ? (() => {
        const descendants = getDescendantIds(currentTaskId);
        return allTasks.filter(
          (t) => t.id !== currentTaskId && !descendants.has(t.id),
        );
      })()
    : allTasks;

  const parentTask = task?.parent_task_id
    ? allTasks.find((t) => t.id === task.parent_task_id) ?? null
    : null;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '80vh', maxHeight: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
        {/* Breadcrumb navigation */}
        <Breadcrumbs sx={{ flexGrow: 1 }}>
          {breadcrumb.map((crumb, index) =>
            index < breadcrumb.length - 1 ? (
              <Link
                key={crumb.id}
                component="button"
                variant="body1"
                underline="hover"
                onClick={() => navigateToBreadcrumb(index)}
                sx={{ cursor: 'pointer' }}
              >
                {crumb.title}
              </Link>
            ) : (
              <Typography key={crumb.id} variant="body1" fontWeight={600}>
                {crumb.title}
              </Typography>
            ),
          )}
        </Breadcrumbs>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {mode === 'view' ? (
            <>
              <Tooltip title={t('taskDetail.editTask')}>
                <IconButton size="small" onClick={() => setMode('edit')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('taskDetail.cloneTask')}>
                <IconButton size="small" onClick={() => setCloneDialogOpen(true)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('report.title')}>
                <IconButton size="small" onClick={() => setReportOpen(true)}>
                  <AssessmentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('activityLog.title')}>
                <IconButton size="small" onClick={() => { if (currentTaskId) { onClose(); navigate(`/tasks/${currentTaskId}/activity-log`); } }}>
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title={t('taskDetail.saveChanges')}>
                <IconButton size="small" color="primary" onClick={handleSave}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('taskDetail.cancelEditing')}>
                <IconButton size="small" onClick={handleCancelEdit}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('taskDetail.deleteTask')}>
                <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('activityLog.title')}>
                <IconButton size="small" onClick={() => { if (currentTaskId) { onClose(); navigate(`/tasks/${currentTaskId}/activity-log`); } }}>
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        <Chip
          icon={mode === 'view' ? <VisibilityIcon /> : <EditIcon />}
          label={mode === 'view' ? t('taskDetail.viewing') : t('taskDetail.editing')}
          size="small"
          color={mode === 'edit' ? 'primary' : 'default'}
          variant="outlined"
        />

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
        ) : task ? (
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {/* ═══ LEFT PANEL: Task Info + Subtasks ═══ */}
            <Box
              sx={{
                width: '50%',
                borderRight: 1,
                borderColor: 'divider',
                overflowY: 'auto',
              }}
            >
              {/* Task properties */}
              <Box sx={{ p: 2 }}>
                {mode === 'view' ? (
                  /* ─── VIEW MODE ─── */
                  <>
                    {/* Description */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('taskDetail.description')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {task.description || t('taskDetail.noDescription')}
                    </Typography>

                    {/* Priority & Current Status */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('taskDetail.priority')}:
                      </Typography>
                      {task.priority ? (
                        <Chip
                          label={t(`priority.${task.priority}`)}
                          size="small"
                          color={priorityColor[task.priority] ?? 'default'}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">{t('common.noneF')}</Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('taskDetail.currentStatus')}:
                      </Typography>
                      <Chip label={currentStatusTitle} size="small" variant="outlined" color="primary" />
                      {/* Quick status change in view mode */}
                      {possibleStatuses.length > 0 && (
                        <TextField
                          select
                          size="small"
                          label={t('taskDetail.change')}
                          value={task.current_status_id ?? ''}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          sx={{ minWidth: 140, ml: 1 }}
                        >
                          <MenuItem value="">
                            <em>{t('common.none')}</em>
                          </MenuItem>
                          {possibleStatuses.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Box>

                    {/* Assignees */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('taskDetail.assignees')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {assignees.length > 0
                        ? assignees.map((u) => (
                            <Chip key={u.id} label={u.name} size="small" />
                          ))
                        : <Typography variant="body2" color="text.secondary">{t('common.none')}</Typography>
                      }
                    </Box>

                    {/* Labels */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('taskDetail.labels')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {taskLabels.length > 0
                        ? taskLabels.map((l) => (
                            <Chip key={l.id} label={l.title} size="small" color="secondary" variant="outlined" />
                          ))
                        : <Typography variant="body2" color="text.secondary">{t('common.noneF')}</Typography>
                      }
                    </Box>

                    {/* Parent Task */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('taskDetail.parentTask')}:
                      </Typography>
                      {parentTask ? (
                        <Chip
                          label={parentTask.title}
                          size="small"
                          variant="outlined"
                          onClick={() => navigateToSubtask(parentTask)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">{t('taskDetail.noParent')}</Typography>
                      )}
                    </Box>

                    {/* Assignor */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('taskDetail.assignor')}:
                      </Typography>
                      <Typography variant="body2">
                        {resolveUser(task.assignor_id)?.name ?? task.assignor_id}
                      </Typography>
                    </Box>

                    {/* Predicted Finish Date */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('taskDetail.predictedFinishDate')}:
                      </Typography>
                      {task.predicted_finish_date ? (
                        <Typography variant="body2">
                          {new Date(task.predicted_finish_date).toLocaleDateString('pt-BR')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">{t('common.noneF')}</Typography>
                      )}
                    </Box>

                    {/* Dates */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('common.created')}: {new Date(task.created_at).toLocaleString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('common.updated')}: {new Date(task.updated_at).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  /* ─── EDIT MODE ─── */
                  <>
                    {/* Title */}
                    <TextField
                      label={t('common.title')}
                      fullWidth
                      required
                      size="small"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    {/* Description */}
                    <TextField
                      label={t('common.description')}
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    {/* Priority */}
                    <TextField
                      label={t('taskDetail.priority')}
                      select
                      fullWidth
                      size="small"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="">{t('common.noneF')}</MenuItem>
                      {PRIORITIES.map((p) => (
                        <MenuItem key={p} value={p}>{t(`priority.${p}`)}</MenuItem>
                      ))}
                    </TextField>

                    {/* Current Status (only from possible statuses) */}
                    <TextField
                      label={t('taskDetail.currentStatus')}
                      select
                      fullWidth
                      size="small"
                      value={task.current_status_id ?? ''}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="">
                        <em>{t('common.none')}</em>
                      </MenuItem>
                      {editPossibleStatusIds
                        .map(resolveStatus)
                        .filter((s): s is Status => !!s)
                        .map((s) => (
                          <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
                        ))
                      }
                    </TextField>

                    {/* Possible Statuses — multi-select */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('taskDetail.possibleStatuses')}
                    </Typography>
                    <Autocomplete
                      multiple
                      options={allStatuses}
                      getOptionLabel={(opt) => opt.title}
                      value={allStatuses.filter((s) => editPossibleStatusIds.includes(s.id))}
                      onChange={(_e, newValue) => {
                        setEditPossibleStatusIds(newValue.map((s) => s.id));
                      }}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={t('taskDetail.selectStatuses')}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option.title}
                              size="small"
                              variant="outlined"
                              {...tagProps}
                            />
                          );
                        })
                      }
                      sx={{ mb: 2 }}
                    />

                    {/* Assignees — multi-select */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('taskDetail.assignees')}
                    </Typography>
                    <Autocomplete
                      multiple
                      options={allUsers}
                      getOptionLabel={(opt) => opt.name}
                      value={allUsers.filter((u) => editAssigneeIds.includes(u.id))}
                      onChange={(_e, newValue) => {
                        setEditAssigneeIds(newValue.map((u) => u.id));
                      }}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={t('taskDetail.selectAssignees')}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option.name}
                              size="small"
                              {...tagProps}
                            />
                          );
                        })
                      }
                      sx={{ mb: 2 }}
                    />

                    {/* Parent Task */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('taskDetail.parentTask')}
                    </Typography>
                    <Autocomplete
                      options={parentTaskCandidates}
                      getOptionLabel={(opt) => opt.title}
                      value={parentTaskCandidates.find((t) => t.id === editParentTaskId) ?? null}
                      onChange={(_e, newValue) => {
                        setEditParentTaskId(newValue?.id ?? null);
                      }}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={t('taskDetail.selectParentTask')}
                        />
                      )}
                      sx={{ mb: 2 }}
                    />

                    {/* Predicted Finish Date */}
                    <TextField
                      label={t('taskDetail.predictedFinishDate')}
                      type="date"
                      fullWidth
                      size="small"
                      value={editPredictedFinishDate}
                      onChange={(e) => setEditPredictedFinishDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{ mb: 2 }}
                    />

                    {/* Save / Cancel buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!editTitle.trim()}
                      >
                        {t('common.save')}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        {t('common.cancel')}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>

              <Divider />

              {/* Subtasks header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountTreeIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">
                    {t('taskDetail.subtasks')} ({directSubtasks.length})
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowSubtaskForm(true)}
                >
                  {t('common.add')}
                </Button>
              </Box>

              {/* Subtask creation form */}
              {showSubtaskForm && (
                <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder={t('taskDetail.subtaskTitle')}
                    fullWidth
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateSubtask();
                      if (e.key === 'Escape') {
                        setShowSubtaskForm(false);
                        setNewSubtaskTitle('');
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleCreateSubtask}
                    disabled={!newSubtaskTitle.trim()}
                  >
                    {t('common.create')}
                  </Button>
                </Box>
              )}

              {/* Subtask list */}
              <Box>
                {directSubtasks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    {t('taskDetail.noSubtasks')}
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {directSubtasks.map((sub) => {
                      const descendantCount = subtaskCountMap.get(sub.id) ?? 0;
                      const subStatus = sub.current_status_id
                        ? resolveStatus(sub.current_status_id)?.title
                        : null;

                      return (
                        <ListItemButton key={sub.id} onClick={() => navigateToSubtask(sub)}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <SubdirectoryArrowRightIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                  {sub.title}
                                </Typography>
                                {subStatus && (
                                  <Chip
                                    label={subStatus}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {sub.priority && (
                                  <Chip
                                    label={t(`priority.${sub.priority}`)}
                                    size="small"
                                    color={priorityColor[sub.priority] ?? 'default'}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              descendantCount > 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                  <Badge badgeContent={descendantCount} color="default" max={999}>
                                    <AccountTreeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                  </Badge>
                                </Box>
                              ) : undefined
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Box>

            {/* ═══ RIGHT PANEL: Comments ═══ */}
            <Box
              sx={{
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              {/* Comments header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5 }}>
                <ChatBubbleOutlineIcon fontSize="small" color="action" />
                <Typography variant="subtitle2">
                  {t('taskDetail.comments')} ({commentsList.length})
                </Typography>
              </Box>

              <Divider />

              {/* Comments list */}
              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, px: 2, py: 1 }}>
                {commentsList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    {t('taskDetail.noComments')}
                  </Typography>
                ) : (
                  commentsList.map((comment) => (
                    <Paper
                      key={comment.id}
                      variant="outlined"
                      sx={{ p: 1.5, mb: 1, borderRadius: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>
                          {resolveUser(comment.creator_id)?.name ?? t('common.unknown')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.created_at).toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Box>

              <Divider />

              {/* Add comment form */}
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder={t('taskDetail.writeComment')}
                  fullWidth
                  multiline
                  maxRows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || sendingComment}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      {/* Clone confirmation dialog */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)} maxWidth="xs">
        <DialogTitle>{t('taskDetail.cloneDialogTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('taskDetail.cloneDialogMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => handleClone(false)}>{t('taskDetail.cloneIndependent')}</Button>
          <Button variant="contained" onClick={() => handleClone(true)}>{t('taskDetail.cloneAsSubtask')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>{t('taskDetail.deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('taskDetail.deleteDialogMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>

      {/* Task Report Modal */}
      <TaskReportModal
        open={reportOpen}
        taskId={currentTaskId}
        allTasks={allTasks}
        onClose={() => setReportOpen(false)}
      />
    </Dialog>
  );
}

export { buildSubtaskCountMap };
