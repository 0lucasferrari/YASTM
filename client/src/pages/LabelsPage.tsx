import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { labels } from '../services/api.ts';
import type { Label } from '../types/index.ts';

export default function LabelsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Label | null>(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    try {
      const data = await labels.list();
      setItems(data as Label[]);
    } catch {
      setError(t('labels.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (item: Label) => {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description ?? '');
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const body = { title, description: description || undefined };
      if (editing) {
        await labels.update(editing.id, body);
      } else {
        await labels.create(body);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.saveFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('labels.deleteConfirm'))) return;
    try {
      await labels.remove(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.deleteFailed'));
    }
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
        <Typography variant="h4">{t('labels.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('labels.newLabel')}
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
                  <TableCell>{t('common.description')}</TableCell>
                  <TableCell>{t('common.created')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {t('labels.emptyState')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell><Typography fontWeight={500}>{item.title}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {item.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t('labels.editLabel') : t('labels.newLabel')}</DialogTitle>
        <DialogContent>
          {error && dialogOpen && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
            rows={2}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
            {editing ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
