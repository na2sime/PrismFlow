import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiEdit2,
  FiTrash2,
  FiArchive,
  FiUsers,
  FiCheckSquare,
  FiClock,
  FiChevronRight,
  FiHome,
  FiUserPlus,
  FiShield,
  FiEye,
  FiUserCheck
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { apiService } from '../../services/api';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';
import AddMemberModal from '../../components/AddMemberModal/AddMemberModal';
import ChangeRoleModal from '../../components/ChangeRoleModal/ChangeRoleModal';
import TaskList from '../../components/TaskList/TaskList';
import CreateTaskModal from '../../components/CreateTaskModal/CreateTaskModal';

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

interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string | null;
}

type TabType = 'overview' | 'tasks' | 'members' | 'activity';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'member' | 'viewer' | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && activeTab === 'members') {
      fetchMembers();
    }
    if (projectId && activeTab === 'tasks') {
      fetchTasks();
    }
  }, [projectId, activeTab]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProject(projectId!);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      // Redirect to projects page if project not found
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await apiService.getProjectMembers(projectId!);
      const fetchedMembers = response.data.members || [];
      setMembers(fetchedMembers);

      // Determine current user's role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user:', user);
      console.log('Project owner:', project?.ownerId);
      console.log('Fetched members:', fetchedMembers);

      const currentUserMember = fetchedMembers.find((m: ProjectMember) => m.userId === user.id);
      if (currentUserMember) {
        console.log('User found in members with role:', currentUserMember.role);
        setUserRole(currentUserMember.role);
      } else if (project?.ownerId === user.id) {
        console.log('User is project owner');
        setUserRole('owner');
      } else {
        console.log('User role not determined');
      }

      console.log('Final userRole:', currentUserMember?.role || (project?.ownerId === user.id ? 'owner' : null));

      // Refresh project to update memberCount
      await fetchProject();
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenChangeRoleModal = (member: ProjectMember) => {
    setSelectedMember(member);
    setIsChangeRoleModalOpen(true);
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    if (!window.confirm(t('projectDetail.members.confirmRemove') || `Remove ${member.firstName} ${member.lastName} from this project?`)) {
      return;
    }

    try {
      await apiService.removeProjectMember(projectId!, member.userId);
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert(t('projectDetail.members.removeError') || 'Failed to remove member');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await apiService.getTasks(projectId!);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal
  };

  const handleTaskEdit = (task: any) => {
    setSelectedTask(task);
    setTaskModalMode('edit');
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskDelete = async (task: any) => {
    if (!window.confirm(t('tasks.confirmDelete') || `Delete task "${task.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteTask(task.id);
      fetchTasks();
      fetchProject(); // Refresh to update task count
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(t('tasks.deleteError') || 'Failed to delete task');
    }
  };

  const handleEdit = () => {
    // TODO: Open edit modal
    console.log('Edit project');
  };

  const handleArchive = async () => {
    if (!window.confirm(t('projects.confirmArchive') || 'Archive this project?')) {
      return;
    }
    try {
      await apiService.updateProject(projectId!, {
        settings: {
          ...project!.settings,
          status: 'archived'
        }
      });
      fetchProject();
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('projects.confirmDelete'))) {
      return;
    }
    try {
      await apiService.deleteProject(projectId!);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status?: 'active' | 'archived' | 'completed') => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.accent;
      case 'archived':
        return theme.colors.textTertiary;
      default:
        return theme.colors.success;
    }
  };

  const statusLabels = {
    active: t('projects.status.active'),
    completed: t('projects.status.completed'),
    archived: t('projects.status.archived'),
  };

  if (loading) {
    return (
      <ThemeLayout className="p-8">
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: theme.colors.accent }}
          ></div>
        </div>
      </ThemeLayout>
    );
  }

  if (!project) {
    return null;
  }

  const projectColor = project.settings.color || '#3B82F6';
  const projectIcon = project.settings.icon || '📁';
  const projectStatus = project.settings.status || 'active';

  const tabs: Array<{ id: TabType; label: string; icon: IconType }> = [
    { id: 'overview' as TabType, label: t('projectDetail.tabs.overview') || 'Overview', icon: FiHome },
    { id: 'tasks' as TabType, label: t('projectDetail.tabs.tasks') || 'Tasks', icon: FiCheckSquare },
    { id: 'members' as TabType, label: t('projectDetail.tabs.members') || 'Members', icon: FiUsers },
    { id: 'activity' as TabType, label: t('projectDetail.tabs.activity') || 'Activity', icon: FiClock },
  ];

  return (
    <ThemeLayout className="p-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-6"
        style={{ color: theme.colors.textSecondary }}
      >
        <button
          onClick={() => navigate('/projects')}
          className="hover:underline transition-colors"
          style={{ color: theme.colors.textSecondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
        >
          {t('projects.title')}
        </button>
        {React.createElement(FiChevronRight as any, { className: "w-4 h-4" })}
        <span style={{ color: theme.colors.textPrimary }}>{project.name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Project Icon */}
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl shadow-lg"
              style={{ backgroundColor: projectColor }}
            >
              {projectIcon}
            </div>

            {/* Project Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {project.name}
                </h1>
                <span
                  className="px-3 py-1 text-sm rounded-full font-medium"
                  style={{
                    backgroundColor: getStatusColor(projectStatus),
                    color: theme.colors.primary,
                  }}
                >
                  {statusLabels[projectStatus]}
                </span>
              </div>
              <p className="text-lg mb-2" style={{ color: theme.colors.textSecondary }}>
                {project.description || t('projectDetail.noDescription') || 'No description'}
              </p>
              <div className="flex items-center gap-4" style={{ color: theme.colors.textTertiary }}>
                <span className="flex items-center gap-1">
                  {React.createElement(FiUsers as any, { className: "w-4 h-4" })}
                  {project.memberCount || 0} {t('projects.members')}
                </span>
                <span className="flex items-center gap-1">
                  {React.createElement(FiCheckSquare as any, { className: "w-4 h-4" })}
                  {project.taskCount || 0} {t('projects.tasks')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.colors.surfaceBorder,
                color: theme.colors.textPrimary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {React.createElement(FiEdit2 as any, { className: "w-4 h-4" })}
              {t('common.edit')}
            </button>
            {projectStatus !== 'archived' && (
              <button
                onClick={handleArchive}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: theme.colors.surfaceBorder,
                  color: theme.colors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {React.createElement(FiArchive as any, { className: "w-4 h-4" })}
                {t('projectDetail.archive') || 'Archive'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.colors.error,
                color: theme.colors.error,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${theme.colors.error}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {React.createElement(FiTrash2 as any, { className: "w-4 h-4" })}
              {t('common.delete')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="border-b mb-6"
        style={{ borderColor: theme.colors.surfaceBorder }}
      >
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-3 transition-all relative"
                style={{
                  color: activeTab === tab.id ? theme.colors.accent : theme.colors.textSecondary,
                  borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.accent}` : 'none',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
              >
                {React.createElement(Icon as any, { className: "w-4 h-4" })}
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistics Cards */}
            {[
              {
                label: t('projectDetail.stats.totalTasks') || 'Total Tasks',
                value: project.taskCount || 0,
                icon: FiCheckSquare,
                color: theme.colors.info,
              },
              {
                label: t('projectDetail.stats.teamMembers') || 'Team Members',
                value: project.memberCount || 0,
                icon: FiUsers,
                color: theme.colors.success,
              },
              {
                label: t('projectDetail.stats.boardType') || 'Board Type',
                value: project.settings.boardLayout.charAt(0).toUpperCase() + project.settings.boardLayout.slice(1),
                icon: FiClock,
                color: theme.colors.accent,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="backdrop-blur-md rounded-lg p-6 border"
                  style={{
                    background: theme.colors.glassBackground,
                    borderColor: theme.colors.glassBorder,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                      }}
                    >
                      {React.createElement(Icon as any, { className: "w-6 h-6" })}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                    {stat.value}
                  </h3>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            {/* Header with Create Task Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {t('tasks.title') || 'Tasks'} ({tasks.length})
              </h2>
              {userRole !== 'viewer' && (
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setTaskModalMode('create');
                    setIsCreateTaskModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {React.createElement(FiCheckSquare as any, { className: "w-4 h-4" })}
                  {t('tasks.createTask') || 'Create Task'}
                </button>
              )}
            </div>

            {/* Task List */}
            <TaskList
              tasks={tasks}
              loading={loadingTasks}
              onTaskClick={handleTaskClick}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              userRole={userRole}
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {/* Header with Add Member Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {t('projectDetail.members.title') || 'Team Members'} ({members.length})
              </h2>
              {userRole === 'owner' && (
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {React.createElement(FiUserPlus as any, { className: "w-4 h-4" })}
                  {t('projectDetail.members.addMember') || 'Add Member'}
                </button>
              )}
            </div>

            {/* Members List */}
            {loadingMembers ? (
              <div className="flex items-center justify-center py-20">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: theme.colors.accent }}
                ></div>
              </div>
            ) : members.length === 0 ? (
              <div
                className="backdrop-blur-md rounded-lg p-8 border text-center"
                style={{
                  background: theme.colors.glassBackground,
                  borderColor: theme.colors.glassBorder,
                }}
              >
                {React.createElement(FiUsers as any, { className: "w-16 h-16 mx-auto mb-4", style: { color: theme.colors.textTertiary } })}
                <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                  {t('projectDetail.members.noMembers') || 'No members yet'}
                </h3>
                <p style={{ color: theme.colors.textSecondary }}>
                  {t('projectDetail.members.noMembersDescription') || 'Add members to collaborate on this project'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, index) => {
                  const roleIcon = member.role === 'owner' ? FiShield : member.role === 'viewer' ? FiEye : FiUserCheck;
                  const roleColor = member.role === 'owner' ? theme.colors.warning : member.role === 'viewer' ? theme.colors.info : theme.colors.success;
                  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.username?.[0]?.toUpperCase() || '?';

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="backdrop-blur-md rounded-lg p-6 border"
                      style={{
                        background: theme.colors.glassBackground,
                        borderColor: theme.colors.glassBorder,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
                          style={{
                            backgroundColor: `${theme.colors.accent}20`,
                            color: theme.colors.accent,
                          }}
                        >
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>

                        {/* Role Badge */}
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${roleColor}20`,
                            color: roleColor,
                          }}
                        >
                          {React.createElement(roleIcon as any, { className: "w-3 h-3" })}
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </div>
                      </div>

                      {/* Member Info */}
                      <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        @{member.username}
                      </p>
                      <p className="text-xs" style={{ color: theme.colors.textTertiary }}>
                        {member.email}
                      </p>

                      {/* Actions */}
                      {member.role !== 'owner' && userRole === 'owner' && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleOpenChangeRoleModal(member)}
                            className="flex-1 px-3 py-1 text-sm rounded-lg border transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: theme.colors.surfaceBorder,
                              color: theme.colors.textPrimary,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {t('projectDetail.members.changeRole') || 'Change Role'}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="px-3 py-1 text-sm rounded-lg border transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: theme.colors.error,
                              color: theme.colors.error,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${theme.colors.error}10`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {React.createElement(FiTrash2 as any, { className: "w-4 h-4" })}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div
            className="backdrop-blur-md rounded-lg p-8 border text-center"
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
          >
            {React.createElement(FiClock as any, { className: "w-16 h-16 mx-auto mb-4", style: { color: theme.colors.textTertiary } })}
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              {t('projectDetail.activityComingSoon') || 'Activity Coming Soon'}
            </h3>
            <p style={{ color: theme.colors.textSecondary }}>
              {t('projectDetail.activityDescription') || 'Activity feed will be available soon'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId!}
        onMemberAdded={fetchMembers}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => {
          setIsChangeRoleModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        projectId={projectId!}
        onRoleChanged={fetchMembers}
      />

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setSelectedTask(null);
          setTaskModalMode('create');
        }}
        projectId={projectId!}
        projectMembers={members}
        onTaskCreated={() => {
          fetchTasks();
          fetchProject(); // Refresh to update task count
        }}
        task={selectedTask}
        mode={taskModalMode}
      />
    </ThemeLayout>
  );
};

export default ProjectDetail;