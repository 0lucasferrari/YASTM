import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import TasksPage from './pages/TasksPage.tsx';
import TeamsPage from './pages/TeamsPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import StatusesPage from './pages/StatusesPage.tsx';
import LabelsPage from './pages/LabelsPage.tsx';
import TaskReportPage from './pages/TaskReportPage.tsx';
import TaskActivityLogPage from './pages/TaskActivityLogPage.tsx';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/report/:taskId" element={<TaskReportPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/statuses" element={<StatusesPage />} />
        <Route path="/labels" element={<LabelsPage />} />
        <Route path="/tasks/:taskId/activity-log" element={<TaskActivityLogPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
