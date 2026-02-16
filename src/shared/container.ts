import connection from '../infrastructure/database/connection';

// Providers
import { BcryptHashProvider } from '../infrastructure/providers/BcryptHashProvider';
import { JwtTokenProvider } from '../infrastructure/providers/JwtTokenProvider';

// Repositories
import { KnexUserRepository } from '../infrastructure/repositories/KnexUserRepository';
import { KnexTeamRepository } from '../infrastructure/repositories/KnexTeamRepository';
import { KnexTaskRepository } from '../infrastructure/repositories/KnexTaskRepository';
import { KnexStatusRepository } from '../infrastructure/repositories/KnexStatusRepository';
import { KnexLabelRepository } from '../infrastructure/repositories/KnexLabelRepository';
import { KnexCommentRepository } from '../infrastructure/repositories/KnexCommentRepository';

// Auth Use Cases
import { RegisterUseCase } from '../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';

// User Use Cases
import { ListUsersUseCase } from '../application/use-cases/user/ListUsersUseCase';
import { GetUserUseCase } from '../application/use-cases/user/GetUserUseCase';
import { UpdateUserUseCase } from '../application/use-cases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../application/use-cases/user/DeleteUserUseCase';

// Team Use Cases
import { CreateTeamUseCase } from '../application/use-cases/team/CreateTeamUseCase';
import { ListTeamsUseCase } from '../application/use-cases/team/ListTeamsUseCase';
import { GetTeamUseCase } from '../application/use-cases/team/GetTeamUseCase';
import { UpdateTeamUseCase } from '../application/use-cases/team/UpdateTeamUseCase';
import { DeleteTeamUseCase } from '../application/use-cases/team/DeleteTeamUseCase';

// Task Use Cases
import { CreateTaskUseCase } from '../application/use-cases/task/CreateTaskUseCase';
import { ListTasksUseCase } from '../application/use-cases/task/ListTasksUseCase';
import { GetTaskUseCase } from '../application/use-cases/task/GetTaskUseCase';
import { UpdateTaskUseCase } from '../application/use-cases/task/UpdateTaskUseCase';
import { DeleteTaskUseCase } from '../application/use-cases/task/DeleteTaskUseCase';
import { AddAssigneeUseCase } from '../application/use-cases/task/AddAssigneeUseCase';
import { RemoveAssigneeUseCase } from '../application/use-cases/task/RemoveAssigneeUseCase';
import { AddTaskStatusUseCase } from '../application/use-cases/task/AddTaskStatusUseCase';
import { SetCurrentStatusUseCase } from '../application/use-cases/task/SetCurrentStatusUseCase';
import { AddTaskLabelUseCase } from '../application/use-cases/task/AddTaskLabelUseCase';
import { RemoveTaskLabelUseCase } from '../application/use-cases/task/RemoveTaskLabelUseCase';

// Status Use Cases
import { CreateStatusUseCase } from '../application/use-cases/status/CreateStatusUseCase';
import { ListStatusesUseCase } from '../application/use-cases/status/ListStatusesUseCase';
import { GetStatusUseCase } from '../application/use-cases/status/GetStatusUseCase';
import { UpdateStatusUseCase } from '../application/use-cases/status/UpdateStatusUseCase';
import { DeleteStatusUseCase } from '../application/use-cases/status/DeleteStatusUseCase';

// Label Use Cases
import { CreateLabelUseCase } from '../application/use-cases/label/CreateLabelUseCase';
import { ListLabelsUseCase } from '../application/use-cases/label/ListLabelsUseCase';
import { GetLabelUseCase } from '../application/use-cases/label/GetLabelUseCase';
import { UpdateLabelUseCase } from '../application/use-cases/label/UpdateLabelUseCase';
import { DeleteLabelUseCase } from '../application/use-cases/label/DeleteLabelUseCase';

// Comment Use Cases
import { CreateCommentUseCase } from '../application/use-cases/comment/CreateCommentUseCase';
import { GetCommentUseCase } from '../application/use-cases/comment/GetCommentUseCase';
import { UpdateCommentUseCase } from '../application/use-cases/comment/UpdateCommentUseCase';
import { DeleteCommentUseCase } from '../application/use-cases/comment/DeleteCommentUseCase';

// --- Instantiate Providers ---
const hashProvider = new BcryptHashProvider();
const tokenProvider = new JwtTokenProvider();

// --- Instantiate Repositories ---
const userRepository = new KnexUserRepository(connection);
const teamRepository = new KnexTeamRepository(connection);
const taskRepository = new KnexTaskRepository(connection);
const statusRepository = new KnexStatusRepository(connection);
const labelRepository = new KnexLabelRepository(connection);
const commentRepository = new KnexCommentRepository(connection);

// --- Instantiate Use Cases ---

// Auth
const registerUseCase = new RegisterUseCase(userRepository, hashProvider);
const loginUseCase = new LoginUseCase(userRepository, hashProvider, tokenProvider);

// Users
const listUsersUseCase = new ListUsersUseCase(userRepository);
const getUserUseCase = new GetUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

// Teams
const createTeamUseCase = new CreateTeamUseCase(teamRepository);
const listTeamsUseCase = new ListTeamsUseCase(teamRepository);
const getTeamUseCase = new GetTeamUseCase(teamRepository);
const updateTeamUseCase = new UpdateTeamUseCase(teamRepository);
const deleteTeamUseCase = new DeleteTeamUseCase(teamRepository);

// Tasks
const createTaskUseCase = new CreateTaskUseCase(taskRepository, userRepository);
const listTasksUseCase = new ListTasksUseCase(taskRepository);
const getTaskUseCase = new GetTaskUseCase(taskRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
const addAssigneeUseCase = new AddAssigneeUseCase(taskRepository, userRepository);
const removeAssigneeUseCase = new RemoveAssigneeUseCase(taskRepository);
const addTaskStatusUseCase = new AddTaskStatusUseCase(taskRepository, statusRepository);
const setCurrentStatusUseCase = new SetCurrentStatusUseCase(taskRepository);
const addTaskLabelUseCase = new AddTaskLabelUseCase(taskRepository, labelRepository);
const removeTaskLabelUseCase = new RemoveTaskLabelUseCase(taskRepository);

// Statuses
const createStatusUseCase = new CreateStatusUseCase(statusRepository);
const listStatusesUseCase = new ListStatusesUseCase(statusRepository);
const getStatusUseCase = new GetStatusUseCase(statusRepository);
const updateStatusUseCase = new UpdateStatusUseCase(statusRepository);
const deleteStatusUseCase = new DeleteStatusUseCase(statusRepository);

// Labels
const createLabelUseCase = new CreateLabelUseCase(labelRepository);
const listLabelsUseCase = new ListLabelsUseCase(labelRepository);
const getLabelUseCase = new GetLabelUseCase(labelRepository);
const updateLabelUseCase = new UpdateLabelUseCase(labelRepository);
const deleteLabelUseCase = new DeleteLabelUseCase(labelRepository);

// Comments
const createCommentUseCase = new CreateCommentUseCase(commentRepository, taskRepository);
const getCommentUseCase = new GetCommentUseCase(commentRepository);
const updateCommentUseCase = new UpdateCommentUseCase(commentRepository);
const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository);

export const container = {
  // Providers
  tokenProvider,

  // Auth
  registerUseCase,
  loginUseCase,

  // Users
  listUsersUseCase,
  getUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,

  // Teams
  createTeamUseCase,
  listTeamsUseCase,
  getTeamUseCase,
  updateTeamUseCase,
  deleteTeamUseCase,

  // Tasks
  createTaskUseCase,
  listTasksUseCase,
  getTaskUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,
  addAssigneeUseCase,
  removeAssigneeUseCase,
  addTaskStatusUseCase,
  setCurrentStatusUseCase,
  addTaskLabelUseCase,
  removeTaskLabelUseCase,

  // Statuses
  createStatusUseCase,
  listStatusesUseCase,
  getStatusUseCase,
  updateStatusUseCase,
  deleteStatusUseCase,

  // Labels
  createLabelUseCase,
  listLabelsUseCase,
  getLabelUseCase,
  updateLabelUseCase,
  deleteLabelUseCase,

  // Comments
  createCommentUseCase,
  getCommentUseCase,
  updateCommentUseCase,
  deleteCommentUseCase,
};

