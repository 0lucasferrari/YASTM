import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography } from '@mui/material';
import KanbanCard from './KanbanCard.tsx';
import type { Task } from '../types/index.ts';

const SORTABLE_PREFIX = 'sortable-col-';

export function sortableIdFromStatusId(statusId: string): string {
  return `${SORTABLE_PREFIX}${statusId}`;
}

export function statusIdFromSortableId(sortableId: string): string {
  return sortableId.startsWith(SORTABLE_PREFIX)
    ? sortableId.slice(SORTABLE_PREFIX.length)
    : sortableId;
}

interface KanbanColumnProps {
  status: { id: string; title: string };
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  subtaskCountMap: Map<string, number>;
}

export default function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  subtaskCountMap,
}: KanbanColumnProps) {
  const { t } = useTranslation();
  const sortableId = sortableIdFromStatusId(status.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: { type: 'column', statusId: status.id },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: status.id,
    data: { type: 'column', statusId: status.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setSortableRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        minWidth: 280,
        maxWidth: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        opacity: isDragging ? 0.6 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {status.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {tasks.length} {t('kanban.tasksCount', { count: tasks.length })}
        </Typography>
      </Box>
      <Box
        ref={setDroppableRef}
        sx={{
          flex: 1,
          minHeight: 100,
          p: 1,
          overflowY: 'auto',
          border: isOver ? 2 : 0,
          borderColor: 'primary.main',
          borderStyle: 'dashed',
          borderRadius: 1,
        }}
      >
        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('kanban.emptyColumn')}
          </Typography>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
              subtaskCount={subtaskCountMap.get(task.id) ?? 0}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
