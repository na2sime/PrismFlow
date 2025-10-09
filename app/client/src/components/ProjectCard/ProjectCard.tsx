import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiTrash2, FiUsers, FiCheckSquare, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: 'active' | 'archived' | 'completed';
  ownerId: string;
  ownerName?: string;
  taskCount?: number;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  index,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.accent;
      case 'archived':
        return theme.colors.textTertiary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const statusLabels = {
    active: t('projects.status.active'),
    completed: t('projects.status.completed'),
    archived: t('projects.status.archived'),
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(project.id);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleCardClick}
        className="backdrop-blur-md rounded-lg p-4 border transition-all cursor-pointer group"
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.colors.glassBackground;
        }}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: project.color }}
          >
            {project.icon}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                {project.name}
              </h3>
              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: getStatusColor(project.status),
                  color: theme.colors.primary,
                }}
              >
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="text-sm line-clamp-1" style={{ color: theme.colors.textSecondary }}>
              {project.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6" style={{ color: theme.colors.textSecondary }}>
            <div className="flex items-center gap-2">
              {FiCheckSquare({}) as any}
              <span>{project.taskCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              {FiUsers({}) as any}
              <span>{project.memberCount || 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: theme.colors.textTertiary,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.textPrimary;
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textTertiary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {FiMoreVertical({}) as any}
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  className="absolute right-0 top-full mt-2 rounded-lg shadow-xl border py-2 min-w-[150px] z-20"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                  }}
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors"
                    style={{ color: theme.colors.textPrimary, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {FiEdit2({}) as any}
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors"
                    style={{ color: theme.colors.error, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${theme.colors.error}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {FiTrash2({}) as any}
                    {t('common.delete')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleCardClick}
      className="backdrop-blur-md rounded-lg p-6 border transition-all cursor-pointer group relative"
      style={{
        background: theme.colors.glassBackground,
        borderColor: theme.colors.glassBorder,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme.colors.glassBackground;
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
          style={{ backgroundColor: project.color }}
        >
          {project.icon}
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            style={{
              color: theme.colors.textTertiary,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.textPrimary;
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textTertiary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {FiMoreVertical({}) as any}
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div
                className="absolute right-0 top-full mt-2 rounded-lg shadow-xl border py-2 min-w-[150px] z-20"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                }}
              >
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors"
                  style={{ color: theme.colors.textPrimary, backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {FiEdit2({}) as any}
                  {t('common.edit')}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors"
                  style={{ color: theme.colors.error, backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.error}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {FiTrash2({}) as any}
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title & Status */}
      <div className="mb-3">
        <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
          {project.name}
        </h3>
        <span
          className="px-3 py-1 text-xs rounded-full"
          style={{
            backgroundColor: getStatusColor(project.status),
            color: theme.colors.primary,
          }}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm mb-6 line-clamp-2 min-h-[40px]" style={{ color: theme.colors.textSecondary }}>
        {project.description}
      </p>

      {/* Footer Stats */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: theme.colors.glassBorder }}
      >
        <div className="flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
          {FiCheckSquare({}) as any}
          <span className="text-sm">
            {project.taskCount || 0} {t('projects.tasks')}
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
          {FiUsers({}) as any}
          <span className="text-sm">
            {project.memberCount || 0} {t('projects.members')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
