import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiTrash2, FiUsers, FiCheckSquare, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    archived: 'bg-gray-500',
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
        className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
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
              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
              <span className={`px-2 py-1 ${statusColors[project.status]} text-white text-xs rounded-full`}>
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="text-gray-300 text-sm line-clamp-1">{project.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-gray-300">
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
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[150px] z-20">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                  >
                    {FiEdit2({}) as any}
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
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
      className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative"
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
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
              <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[150px] z-20">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  {FiEdit2({}) as any}
                  {t('common.edit')}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
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
        <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
        <span className={`px-3 py-1 ${statusColors[project.status]} text-white text-xs rounded-full`}>
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-6 line-clamp-2 min-h-[40px]">
        {project.description}
      </p>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-gray-300">
          {FiCheckSquare({}) as any}
          <span className="text-sm">{project.taskCount || 0} {t('projects.tasks')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          {FiUsers({}) as any}
          <span className="text-sm">{project.memberCount || 0} {t('projects.members')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;