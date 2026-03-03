import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Chip, Typography, Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import type { Task } from '../types/index.ts';

const priorityColor: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
};

export const CARD_ID_PREFIX = 'task-';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  subtaskCount: number;
}

export default function KanbanCard({ task, onClick, subtaskCount }: KanbanCardProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${CARD_ID_PREFIX}${task.id}`,
    data: { task },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        mb: 1,
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {task.title}
        </Typography>
        {task.description && (
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.5 }}>
            {task.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, alignItems: 'center' }}>
          {task.priority && (
            <Chip
              label={t(`priority.${task.priority}`)}
              size="small"
              color={priorityColor[task.priority] ?? 'default'}
            />
          )}
          {subtaskCount > 0 && (
            <Chip
              icon={<AccountTreeIcon sx={{ fontSize: 14 }} />}
              label={subtaskCount}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
