import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, CircularProgress, Alert, Autocomplete, TextField } from '@mui/material';
import { tasks, statuses as statusApi } from '../services/api.ts';
import type { Task, Status } from '../types/index.ts';
import TaskDetailModal, { buildSubtaskCountMap } from '../components/TaskDetailModal.tsx';
import KanbanColumn, {
  sortableIdFromStatusId,
  statusIdFromSortableId,
} from '../components/KanbanColumn.tsx';
import { CARD_ID_PREFIX } from '../components/KanbanCard.tsx';

const STORAGE_KEY = 'kanban-column-order';

function loadColumnOrder(statusIds: string[]): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return parsed.filter(
        (id) => statusIds.includes(id) || id === '__no_status__',
      );
    }
  } catch {
    // ignore
  }
  return ['__no_status__', ...statusIds];
}

function saveColumnOrder(order: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

/** Recursively collect all descendant task IDs of a given ancestor */
function collectDescendantIds(ancestorId: string, allTasks: Task[]): Set<string> {
  const ids = new Set<string>();
  const children = allTasks.filter((t) => t.parent_task_id === ancestorId);
  for (const child of children) {
    ids.add(child.id);
    const childDescendants = collectDescendantIds(child.id, allTasks);
    childDescendants.forEach((id) => ids.add(id));
  }
  return ids;
}

export default function KanbanPage() {
  const { t } = useTranslation();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterParentTaskId, setFilterParentTaskId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const [taskData, statusData] = await Promise.all([
        tasks.list(),
        statusApi.list(),
      ]);
      setAllTasks(taskData);
      const statuses = statusData as Status[];
      setAllStatuses(statuses);

      const statusIds = statuses.map((s) => s.id);
      const order = loadColumnOrder(statusIds);
      const missing = statusIds.filter((id) => !order.includes(id));
      const newOrder = [...order, ...missing];
      setColumnOrder(newOrder);
    } catch {
      setError(t('tasks.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const subtaskCountMap = buildSubtaskCountMap(allTasks);

  const filteredTasks = filterParentTaskId
    ? (() => {
        const descendantIds = collectDescendantIds(filterParentTaskId, allTasks);
        return allTasks.filter((t) => descendantIds.has(t.id));
      })()
    : allTasks;

  const orderedColumns = columnOrder.map((id) => {
    if (id === '__no_status__') {
      return { id: '__no_status__', title: t('kanban.noStatus') };
    }
    const s = allStatuses.find((x) => x.id === id);
    return s ? { id: s.id, title: s.title } : null;
  }).filter(Boolean) as { id: string; title: string }[];

  const tasksByStatus = new Map<string, Task[]>();
  for (const col of orderedColumns) {
    tasksByStatus.set(col.id, []);
  }
  const columnIds = new Set(orderedColumns.map((c) => c.id));
  for (const task of filteredTasks) {
    let statusId = task.current_status_id ?? '__no_status__';
    if (!columnIds.has(statusId)) {
      statusId = '__no_status__';
    }
    const list = tasksByStatus.get(statusId);
    if (list) {
      list.push(task);
    } else {
      tasksByStatus.set(statusId, [task]);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);

      if (activeId.startsWith(CARD_ID_PREFIX)) {
        const taskId = activeId.slice(CARD_ID_PREFIX.length);
        const targetStatusId = String(over.id);

        if (targetStatusId.startsWith('sortable-col-')) return;

        const task = filteredTasks.find((t) => t.id === taskId) ?? allTasks.find((t) => t.id === taskId);
        if (!task) return;

        const prevStatusId = task.current_status_id ?? '__no_status__';
        if (prevStatusId === targetStatusId) return;

        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, current_status_id: targetStatusId === '__no_status__' ? null : targetStatusId }
              : t,
          ),
        );

        try {
          if (targetStatusId === '__no_status__') {
            await tasks.update(taskId, { current_status_id: null });
          } else {
            const possible = task.possible_status_ids ?? [];
            if (!possible.includes(targetStatusId)) {
              await tasks.addStatus(taskId, targetStatusId);
            }
            await tasks.setCurrentStatus(taskId, targetStatusId);
          }
        } catch {
          setAllTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, current_status_id: task.current_status_id } : t,
            ),
          );
          setError(t('taskDetail.changeStatusFailed'));
        } finally {
          load();
        }
        return;
      }

      if (activeId.startsWith('sortable-col-')) {
        const overId = String(over.id);
        if (!overId.startsWith('sortable-col-')) return;

        const items = columnOrder.map((id) => sortableIdFromStatusId(id));
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(items, oldIndex, newIndex);
        const newOrder = newItems.map((sid) => statusIdFromSortableId(sid));
        setColumnOrder(newOrder);
        saveColumnOrder(newOrder);
      }
    },
    [allTasks, filteredTasks, columnOrder, t, load],
  );

  const handleTaskClick = (taskId: string) => {
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

  const sortableItems = columnOrder.map((id) => sortableIdFromStatusId(id));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('kanban.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Autocomplete
        options={allTasks}
        getOptionLabel={(opt) => opt.title}
        value={allTasks.find((t) => t.id === filterParentTaskId) ?? null}
        onChange={(_e, newValue) => {
          setFilterParentTaskId(newValue?.id ?? null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('kanban.filterByTask')}
            placeholder={t('kanban.filterByTaskPlaceholder')}
          />
        )}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItems}
          strategy={horizontalListSortingStrategy}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              minHeight: 400,
            }}
          >
            {orderedColumns.map((col) => (
              <KanbanColumn
                key={col.id}
                status={col}
                tasks={tasksByStatus.get(col.id) ?? []}
                onTaskClick={handleTaskClick}
                subtaskCountMap={subtaskCountMap}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

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
