import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import LabelIcon from '@mui/icons-material/Label';
import TrafficIcon from '@mui/icons-material/Traffic';
import { tasks, users, teams, labels, statuses } from '../services/api.ts';

interface StatCard {
  labelKey: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [taskList, userList, teamList, labelList, statusList] =
          await Promise.all([
            tasks.list().catch(() => []),
            users.list().catch(() => []),
            teams.list().catch(() => []),
            labels.list().catch(() => []),
            statuses.list().catch(() => []),
          ]);

        setStats([
          { labelKey: 'dashboard.tasks', count: taskList.length, icon: <TaskIcon sx={{ fontSize: 40 }} />, color: '#1976d2', path: '/tasks' },
          { labelKey: 'dashboard.users', count: userList.length, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', path: '/users' },
          { labelKey: 'dashboard.teams', count: teamList.length, icon: <GroupWorkIcon sx={{ fontSize: 40 }} />, color: '#ed6c02', path: '/teams' },
          { labelKey: 'dashboard.statuses', count: statusList.length, icon: <TrafficIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', path: '/statuses' },
          { labelKey: 'dashboard.labels', count: labelList.length, icon: <LabelIcon sx={{ fontSize: 40 }} />, color: '#d32f2f', path: '/labels' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid key={s.labelKey} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}
              onClick={() => navigate(s.path)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: s.color }}>{s.icon}</Box>
                <Box>
                  <Typography variant="h4">{s.count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(s.labelKey)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
