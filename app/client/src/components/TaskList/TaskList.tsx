import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheckSquare,
  FiClock,
  FiUser,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFilter,
  FiX
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique assignees for filter dropdown
  const uniqueAssignees = useMemo(() => {
    const assignees = tasks
      .filter(task => task.assignee)
      .map(task => task.assignee!)
      .filter((assignee, index, self) =>
        index === self.findIndex(a => a.id === assignee.id)
      );
    return assignees;
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !task.assigneeId) ||
        (task.assigneeId === assigneeFilter);

      return matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
  };

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
    <div className="space-y-4">
      {/* Filters Section */}
      <div
        className="backdrop-blur-md rounded-lg p-4 border"
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {React.createElement(FiFilter as any, { className: "w-5 h-5", style: { color: theme.colors.accent } })}
            <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
              {t('tasks.filters') || 'Filters'}
            </h3>
            {hasActiveFilters && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${theme.colors.accent}20`,
                  color: theme.colors.accent,
                }}
              >
                {filteredTasks.length} / {tasks.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm px-3 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: showFilters ? `${theme.colors.accent}20` : 'transparent',
              color: theme.colors.accent,
            }}
          >
            {showFilters ? t('common.close') : t('tasks.showFilters') || 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                {t('common.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderColor: theme.colors.surfaceBorder,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="all">{t('projects.filters.all') || 'All'}</option>
                <option value="todo">{t('tasks.status.todo')}</option>
                <option value="in_progress">{t('tasks.status.inProgress')}</option>
                <option value="review">{t('tasks.status.review')}</option>
                <option value="done">{t('tasks.status.done')}</option>
                <option value="cancelled">{t('tasks.status.cancelled')}</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                {t('tasks.priority') || 'Priority'}
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderColor: theme.colors.surfaceBorder,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="all">{t('projects.filters.all') || 'All'}</option>
                <option value="low">{t('tasks.priority.low')}</option>
                <option value="medium">{t('tasks.priority.medium')}</option>
                <option value="high">{t('tasks.priority.high')}</option>
                <option value="critical">{t('tasks.priority.critical')}</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                {t('tasks.assignee')}
              </label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderColor: theme.colors.surfaceBorder,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="all">{t('projects.filters.all') || 'All'}</option>
                <option value="unassigned">{t('tasks.unassigned')}</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.firstName} {assignee.lastName}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {filteredTasks.length} {t('tasks.resultsFound') || 'results found'}
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: `${theme.colors.error}20`,
                color: theme.colors.error,
              }}
            >
              {React.createElement(FiX as any, { className: "w-3 h-3" })}
              {t('tasks.clearFilters') || 'Clear Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="backdrop-blur-md rounded-lg border overflow-hidden"
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.glassBorder}` }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {t('tasks.taskTitle')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {t('tasks.tags')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {t('tasks.assignee')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {t('common.status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {t('tasks.priority')}
                </th>
                {userRole !== 'viewer' && (
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                    {t('common.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * index }}
                  className="cursor-pointer transition-colors hover:bg-opacity-50"
                  style={{
                    borderBottom: `1px solid ${theme.colors.glassBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.surfaceHover}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => onTaskClick(task)}
                >
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: theme.colors.textTertiary }}>
                      #{task.id.substring(0, 8)}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <div className="font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Tags (max 3) */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.tags && task.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded whitespace-nowrap"
                          style={{
                            backgroundColor: `${theme.colors.accent}15`,
                            color: theme.colors.accent,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags && task.tags.length > 3 && (
                        <span className="text-xs" style={{ color: theme.colors.textTertiary }}>
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        {task.assignee.profilePicture ? (
                          <img
                            src={task.assignee.profilePicture}
                            alt={`${task.assignee.firstName} ${task.assignee.lastName}`}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{
                              backgroundColor: `${theme.colors.accent}30`,
                              color: theme.colors.accent,
                            }}
                          >
                            {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                          </div>
                        )}
                        <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                          {task.assignee.firstName} {task.assignee.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm italic" style={{ color: theme.colors.textTertiary }}>
                        {t('tasks.unassigned')}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded whitespace-nowrap inline-block"
                      style={{
                        backgroundColor: `${getStatusColor(task.status)}20`,
                        color: getStatusColor(task.status),
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      ></div>
                      <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  {userRole !== 'viewer' && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                          }}
                          className="p-1.5 rounded-lg hover:bg-opacity-80 transition-colors"
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
                          className="p-1.5 rounded-lg hover:bg-opacity-80 transition-colors"
                          style={{
                            backgroundColor: `${theme.colors.error}20`,
                            color: theme.colors.error,
                          }}
                          title={t('common.delete')}
                        >
                          {React.createElement(FiTrash2 as any, { className: "w-4 h-4" })}
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results message */}
        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="p-8 text-center">
            <p style={{ color: theme.colors.textSecondary }}>
              {t('tasks.noResultsFound') || 'No tasks match the current filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;