import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheckSquare,
  FiClock,
  FiUser,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiCalendar
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  boardId: string | null;
  position: number;
  tags: string[];
  dueDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string | null;
  };
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  userRole: 'owner' | 'member' | 'viewer' | null;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  userRole
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return theme.colors.textSecondary;
      case 'in_progress':
        return theme.colors.info;
      case 'review':
        return theme.colors.warning;
      case 'done':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.info;
      case 'high':
        return theme.colors.warning;
      case 'critical':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      todo: t('tasks.status.todo') || 'To Do',
      in_progress: t('tasks.status.inProgress') || 'In Progress',
      review: t('tasks.status.review') || 'Review',
      done: t('tasks.status.done') || 'Done',
      cancelled: t('tasks.status.cancelled') || 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: t('tasks.priority.low') || 'Low',
      medium: t('tasks.priority.medium') || 'Medium',
      high: t('tasks.priority.high') || 'High',
      critical: t('tasks.priority.critical') || 'Critical',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: theme.colors.accent }}
        ></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className="backdrop-blur-md rounded-lg p-8 border text-center"
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder,
        }}
      >
        {React.createElement(FiCheckSquare as any, { className: "w-16 h-16 mx-auto mb-4", style: { color: theme.colors.textTertiary } })}
        <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
          {t('tasks.noTasks') || 'No tasks yet'}
        </h3>
        <p style={{ color: theme.colors.textSecondary }}>
          {t('tasks.noTasksDescription') || 'Create your first task to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
          className="backdrop-blur-md rounded-lg p-4 border cursor-pointer hover:shadow-lg transition-all"
          style={{
            background: theme.colors.glassBackground,
            borderColor: theme.colors.glassBorder,
          }}
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Task info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {/* Status badge */}
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: `${getStatusColor(task.status)}20`,
                    color: getStatusColor(task.status),
                  }}
                >
                  {getStatusLabel(task.status)}
                </span>

                {/* Priority badge */}
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: `${getPriorityColor(task.priority)}20`,
                    color: getPriorityColor(task.priority),
                  }}
                >
                  {getPriorityLabel(task.priority)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                {task.title}
              </h3>

              {/* Description */}
              {task.description && (
                <p className="text-sm mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                  {task.description}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs" style={{ color: theme.colors.textTertiary }}>
                {/* Assignee */}
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    {React.createElement(FiUser as any, { className: "w-3 h-3" })}
                    <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                  </div>
                )}

                {/* Due date */}
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    {React.createElement(FiCalendar as any, { className: "w-3 h-3" })}
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Estimated hours */}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    {React.createElement(FiClock as any, { className: "w-3 h-3" })}
                    <span>{task.estimatedHours}h</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: `${theme.colors.accent}15`,
                        color: theme.colors.accent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            {userRole !== 'viewer' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskEdit(task);
                  }}
                  className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                  style={{
                    backgroundColor: `${theme.colors.accent}20`,
                    color: theme.colors.accent,
                  }}
                  title={t('common.edit')}
                >
                  {React.createElement(FiEdit2 as any, { className: "w-4 h-4" })}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskDelete(task);
                  }}
                  className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                  style={{
                    backgroundColor: `${theme.colors.error}20`,
                    color: theme.colors.error,
                  }}
                  title={t('common.delete')}
                >
                  {React.createElement(FiTrash2 as any, { className: "w-4 h-4" })}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;