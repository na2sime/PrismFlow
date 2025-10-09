import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiGrid, FiList, FiSearch, FiFilter } from 'react-icons/fi';
import { apiService } from '../../services/api';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProjectModal from '../../components/ProjectModal/ProjectModal';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';

// Wrappers to fix React 19 icon type issues
const IconSearch = (props: any) => FiSearch(props) as any;
const IconFilter = (props: any) => FiFilter(props) as any;
const IconGrid = (props: any) => FiGrid(props) as any;
const IconList = (props: any) => FiList(props) as any;
const IconPlus = (props: any) => FiPlus(props) as any;

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  taskCount?: number;
  memberCount?: number;
  settings: {
    visibility: 'private' | 'public';
    allowGuests: boolean;
    boardLayout: 'scrum' | 'kanban' | 'list' | 'calendar';
    color?: string;
    icon?: string;
    status?: 'active' | 'archived' | 'completed';
  };
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => (project.settings?.status || 'active') === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm(t('projects.confirmDelete'))) {
      return;
    }

    try {
      await apiService.deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleModalSave = async () => {
    setIsModalOpen(false);
    setEditingProject(null);
    await fetchProjects();
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => (p.settings?.status || 'active') === 'active').length,
    completed: projects.filter((p) => (p.settings?.status || 'active') === 'completed').length,
    archived: projects.filter((p) => (p.settings?.status || 'active') === 'archived').length,
  };

  return (
    <ThemeLayout className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{t('projects.title')}</h1>
        <p style={{ color: theme.colors.textSecondary }}>{t('projects.subtitle')}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('projects.stats.total'), value: stats.total, color: theme.colors.info },
          { label: t('projects.stats.active'), value: stats.active, color: theme.colors.success },
          { label: t('projects.stats.completed'), value: stats.completed, color: theme.colors.accent },
          { label: t('projects.stats.archived'), value: stats.archived, color: theme.colors.textTertiary },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            className="backdrop-blur-md rounded-lg p-6 border"
          >
            <div
              className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center font-bold text-xl"
              style={{
                backgroundColor: stat.color,
                color: theme.colors.primary,
              }}
            >
              {stat.value}
            </div>
            <p style={{ color: theme.colors.textSecondary }} className="text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder,
        }}
        className="backdrop-blur-md rounded-lg p-4 mb-6 border"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.textTertiary }}
            />
            <input
              type="text"
              placeholder={t('projects.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
              style={{
                backgroundColor: theme.colors.surfaceHover,
                borderColor: theme.colors.surfaceBorder,
                color: theme.colors.textPrimary,
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <IconFilter
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.textTertiary }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 appearance-none cursor-pointer transition"
                style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderColor: theme.colors.surfaceBorder,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="all">{t('projects.filters.all')}</option>
                <option value="active">{t('projects.filters.active')}</option>
                <option value="completed">{t('projects.filters.completed')}</option>
                <option value="archived">{t('projects.filters.archived')}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div
              className="flex rounded-lg border"
              style={{
                backgroundColor: theme.colors.surfaceHover,
                borderColor: theme.colors.surfaceBorder,
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-l-lg transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? theme.colors.accent : 'transparent',
                  color: viewMode === 'grid' ? theme.colors.primary : theme.colors.textTertiary,
                }}
              >
                <IconGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-r-lg transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? theme.colors.accent : 'transparent',
                  color: viewMode === 'list' ? theme.colors.primary : theme.colors.textTertiary,
                }}
              >
                <IconList size={20} />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
              }}
            >
              <IconPlus />
              {t('projects.create')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: theme.colors.accent }}
          ></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-lg mb-4" style={{ color: theme.colors.textSecondary }}>
            {searchQuery || statusFilter !== 'all'
              ? t('projects.noResults')
              : t('projects.empty')}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
              }}
            >
              {t('projects.createFirst')}
            </button>
          )}
        </motion.div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              index={index}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        project={editingProject}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </ThemeLayout>
  );
};

export default Projects;