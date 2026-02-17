import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tasks, users as usersApi, statuses as statusesApi, labels as labelsApi } from '../services/api.ts';
import type { Task, TaskActivityLog, User, Status, Label } from '../types/index.ts';

export default function TaskActivityLogPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [logs, setLogs] = useState<TaskActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [includeSubtasks, setIncludeSubtasks] = useState(false);

  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [taskMap, setTaskMap] = useState<Record<string, string>>({});
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [taskTitle, setTaskTitle] = useState('');

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load all reference data once
  useEffect(() => {
    Promise.all([
      usersApi.list(),
      tasks.list(),
      statusesApi.list(),
      labelsApi.list(),
    ]).then(([userList, taskList, statusList, labelList]: [User[], Task[], Status[], Label[]]) => {
      const uMap: Record<string, string> = {};
      for (const u of userList) uMap[u.id] = u.name;
      setUserMap(uMap);

      const tMap: Record<string, string> = {};
      for (const tk of taskList) tMap[tk.id] = tk.title;
      setTaskMap(tMap);

      const sMap: Record<string, string> = {};
      for (const s of statusList) sMap[s.id] = s.title;
      setStatusMap(sMap);

      const lMap: Record<string, string> = {};
      for (const l of labelList) lMap[l.id] = l.title;
      setLabelMap(lMap);
    });
  }, []);

  // Load task title
  useEffect(() => {
    if (!taskId) return;
    tasks.get(taskId).then((task) => setTaskTitle(task.title)).catch(() => {});
  }, [taskId]);

  const fetchLogs = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      // Build ISO date strings for the API; startDate starts at 00:00, endDate ends at 23:59:59
      const sd = startDate ? new Date(startDate + 'T00:00:00').toISOString() : undefined;
      const ed = endDate ? new Date(endDate + 'T23:59:59.999').toISOString() : undefined;

      const result = await tasks.activityLogs(taskId, page + 1, rowsPerPage, includeSubtasks, sd, ed);
      setLogs(result.items);
      setTotal(result.total);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [taskId, page, rowsPerPage, includeSubtasks, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleToggleSubtasks = () => {
    setIncludeSubtasks((prev) => !prev);
    setPage(0);
  };

  const formatAction = (action: string) => {
    const key = `activityLog.actions.${action}`;
    const translated = t(key);
    return translated === key ? action.replace(/_/g, ' ') : translated;
  };

  // ─── Value resolution helpers ───────────────────────────────────────────────

  /** Try to parse a JSON array of UUIDs and resolve each via the given map.
   *  Falls back to single-ID lookup if the value is not a JSON array. */
  const resolveIdArray = useCallback(
    (raw: string, map: Record<string, string>): string => {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return arr.map((id: string) => map[id] ?? id).join(', ');
        }
      } catch {
        /* not JSON, try as single ID */
      }
      // Single ID fallback
      return map[raw] ?? raw;
    },
    [],
  );

  /** Try to parse a JSON object and format it readably. */
  const resolveJsonObject = useCallback((raw: string): string => {
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.entries(obj)
          .map(([k, v]) => `${k}: ${v ?? '—'}`)
          .join(', ');
      }
    } catch {
      /* not JSON */
    }
    return raw;
  }, []);

  /** Format a predicted_finish_date value. */
  const formatDateValue = useCallback((raw: string): string => {
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    } catch {
      /* not a date */
    }
    return raw;
  }, []);

  /**
   * Resolve a single value (old_value or new_value) to a human-readable string
   * based on the action type and field.
   */
  const resolveValue = useMemo(() => {
    return (action: string, field: string | null, raw: string | null): string => {
      if (raw === null || raw === undefined) return '—';

      switch (action) {
        // TASK_CREATED / TASK_DELETED store JSON objects like { title, description }
        case 'TASK_CREATED':
        case 'TASK_DELETED':
          return resolveJsonObject(raw);

        // TASK_UPDATED — field-level resolution
        case 'TASK_UPDATED':
          switch (field) {
            case 'parent_task_id':
              return taskMap[raw] ?? raw;
            case 'priority': {
              const pKey = `priority.${raw}`;
              const translated = t(pKey);
              return translated === pKey ? raw : translated;
            }
            case 'predicted_finish_date':
              return formatDateValue(raw);
            default:
              // title, description — plain strings
              return raw;
          }

        // Assignee actions store JSON arrays of user IDs
        case 'ASSIGNEE_ADDED':
        case 'ASSIGNEE_REMOVED':
          return resolveIdArray(raw, userMap);

        // Status add/remove store JSON arrays of status IDs
        case 'STATUS_ADDED':
        case 'STATUS_REMOVED':
          return resolveIdArray(raw, statusMap);

        // Current status changed — single status ID
        case 'CURRENT_STATUS_CHANGED':
          return statusMap[raw] ?? raw;

        // Label actions store JSON arrays of label IDs
        case 'LABEL_ADDED':
        case 'LABEL_REMOVED':
          return resolveIdArray(raw, labelMap);

        // Clone — old_value = source task ID, new_value = new task ID
        case 'TASK_CLONED':
          return taskMap[raw] ?? raw;

        // Comment added — plain text
        case 'COMMENT_ADDED':
          return raw;

        default:
          return raw;
      }
    };
  }, [userMap, taskMap, statusMap, labelMap, t, resolveIdArray, resolveJsonObject, formatDateValue]);

  /** Translate field names to human-readable labels. */
  const formatField = (field: string | null): string => {
    if (!field) return '—';
    const fieldKey = `activityLog.fields.${field}`;
    const translated = t(fieldKey);
    return translated === fieldKey ? field : translated;
  };

  const columnCount = includeSubtasks ? 7 : 6;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Tooltip title={t('activityLog.back')}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {t('activityLog.title')} — {taskTitle}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={includeSubtasks}
              onChange={handleToggleSubtasks}
              color="primary"
            />
          }
          label={t('activityLog.includeSubtasks')}
        />
      </Box>

      {/* Date range filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label={t('activityLog.startDate')}
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />
        <TextField
          label={t('activityLog.endDate')}
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('activityLog.date')}</TableCell>
                  {includeSubtasks && <TableCell>{t('activityLog.task')}</TableCell>}
                  <TableCell>{t('activityLog.user')}</TableCell>
                  <TableCell>{t('activityLog.action')}</TableCell>
                  <TableCell>{t('activityLog.field')}</TableCell>
                  <TableCell>{t('activityLog.oldValue')}</TableCell>
                  <TableCell>{t('activityLog.newValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columnCount} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        {t('activityLog.noLogs')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      {includeSubtasks && (
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Tooltip title={taskMap[log.task_id] ?? log.task_id}>
                            <span>{taskMap[log.task_id] ?? log.task_id}</span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>{userMap[log.user_id] ?? log.user_id}</TableCell>
                      <TableCell>{formatAction(log.action)}</TableCell>
                      <TableCell>{formatField(log.field)}</TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={resolveValue(log.action, log.field, log.old_value)}>
                          <span>{resolveValue(log.action, log.field, log.old_value)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={resolveValue(log.action, log.field, log.new_value)}>
                          <span>{resolveValue(log.action, log.field, log.new_value)}</span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={t('activityLog.rowsPerPage')}
          />
        </Paper>
      )}
    </Box>
  );
}
