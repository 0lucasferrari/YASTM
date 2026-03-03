import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import type { Task } from '../types/index.ts';

const priorityColor: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
};

interface PublicTaskDetailModalProps {
  open: boolean;
  task: Task | null;
  allTasks: Task[];
  statuses: { id: string; title: string }[];
  users: { id: string; name: string }[];
  onClose: () => void;
}

export default function PublicTaskDetailModal({
  open,
  task,
  allTasks,
  statuses,
  users,
  onClose,
}: PublicTaskDetailModalProps) {
  const { t } = useTranslation();

  if (!task) return null;

  const resolveStatus = (id: string) => statuses.find((s) => s.id === id);
  const resolveUser = (id: string) => users.find((u) => u.id === id);
  const parentTask = task.parent_task_id
    ? allTasks.find((t) => t.id === task.parent_task_id)
    : null;
  const subtasks = allTasks.filter((t) => t.parent_task_id === task.id);

  const statusTitle = task.current_status_id
    ? resolveStatus(task.current_status_id)?.title ?? '—'
    : t('report.noStatus');
  const assigneeNames = (task.assignee_ids ?? [])
    .map((id) => resolveUser(id)?.name)
    .filter(Boolean)
    .join(', ') || '—';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="span" noWrap sx={{ flex: 1, mr: 2 }}>
          {task.title}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label={t('common.close')}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {task.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('taskDetail.description')}
            </Typography>
            <Typography variant="body2">{task.description}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {task.priority && (
            <Chip
              label={t(`priority.${task.priority}`)}
              size="small"
              color={priorityColor[task.priority] ?? 'default'}
            />
          )}
          <Chip
            label={statusTitle}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('taskDetail.assignees')}
          </Typography>
          <Typography variant="body2">{assigneeNames}</Typography>
        </Box>

        {task.predicted_finish_date && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('taskDetail.predictedFinishDate')}
            </Typography>
            <Typography variant="body2">
              {new Date(task.predicted_finish_date).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        )}

        {parentTask && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('taskDetail.parentTask')}
            </Typography>
            <Typography variant="body2">{parentTask.title}</Typography>
          </Box>
        )}

        {subtasks.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('taskDetail.subtasks')}
            </Typography>
            <List dense disablePadding>
              {subtasks.map((st) => (
                <ListItem key={st.id} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SubdirectoryArrowRightIcon sx={{ fontSize: 16 }} />
                        {st.title}
                      </Box>
                    }
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
