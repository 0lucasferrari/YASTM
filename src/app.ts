import express from 'express';
import { container } from './shared/container';
import { authMiddleware } from './presentation/middlewares/authMiddleware';
import { errorHandler } from './presentation/middlewares/errorHandler';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';
import { TeamController } from './presentation/controllers/TeamController';
import { TaskController } from './presentation/controllers/TaskController';
import { StatusController } from './presentation/controllers/StatusController';
import { LabelController } from './presentation/controllers/LabelController';
import { CommentController } from './presentation/controllers/CommentController';
import { ReportController } from './presentation/controllers/ReportController';

// Routes
import { authRoutes } from './presentation/routes/authRoutes';
import { userRoutes } from './presentation/routes/userRoutes';
import { teamRoutes } from './presentation/routes/teamRoutes';
import { taskRoutes } from './presentation/routes/taskRoutes';
import { statusRoutes } from './presentation/routes/statusRoutes';
import { labelRoutes } from './presentation/routes/labelRoutes';
import { commentRoutes } from './presentation/routes/commentRoutes';
import { reportRoutes } from './presentation/routes/reportRoutes';

const app = express();

app.use(express.json());

// Health check (no auth)
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// --- Instantiate Controllers ---
const authController = new AuthController(
  container.registerUseCase,
  container.loginUseCase,
);

const userController = new UserController(
  container.listUsersUseCase,
  container.getUserUseCase,
  container.updateUserUseCase,
  container.deleteUserUseCase,
);

const teamController = new TeamController(
  container.createTeamUseCase,
  container.listTeamsUseCase,
  container.getTeamUseCase,
  container.updateTeamUseCase,
  container.deleteTeamUseCase,
);

const taskController = new TaskController(
  container.createTaskUseCase,
  container.listTasksUseCase,
  container.getTaskUseCase,
  container.updateTaskUseCase,
  container.deleteTaskUseCase,
  container.addAssigneeUseCase,
  container.removeAssigneeUseCase,
  container.addTaskStatusUseCase,
  container.removeTaskStatusUseCase,
  container.setCurrentStatusUseCase,
  container.addTaskLabelUseCase,
  container.removeTaskLabelUseCase,
  container.cloneTaskUseCase,
  container.createCommentUseCase,
  container.listCommentsByTaskUseCase,
  container.listTaskActivityLogsUseCase,
);

const statusController = new StatusController(
  container.createStatusUseCase,
  container.listStatusesUseCase,
  container.getStatusUseCase,
  container.updateStatusUseCase,
  container.deleteStatusUseCase,
);

const labelController = new LabelController(
  container.createLabelUseCase,
  container.listLabelsUseCase,
  container.getLabelUseCase,
  container.updateLabelUseCase,
  container.deleteLabelUseCase,
);

const commentController = new CommentController(
  container.getCommentUseCase,
  container.updateCommentUseCase,
  container.deleteCommentUseCase,
);

const reportController = new ReportController(
  container.getTaskReportUseCase,
);

// --- Public routes (no auth required) ---
app.use('/api/auth', authRoutes(authController));
app.use('/api/reports', reportRoutes(reportController));

// --- Protected routes (auth required) ---
const auth = authMiddleware(container.tokenProvider);
app.use('/api/users', auth, userRoutes(userController));
app.use('/api/teams', auth, teamRoutes(teamController));
app.use('/api/tasks', auth, taskRoutes(taskController));
app.use('/api/statuses', auth, statusRoutes(statusController));
app.use('/api/labels', auth, labelRoutes(labelController));
app.use('/api/comments', auth, commentRoutes(commentController));

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
