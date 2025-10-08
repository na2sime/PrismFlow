import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Shield,
  User,
  X,
  Save,
  Mail,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

const Users: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'roles'>('info');

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setUserRoles([]);
    setActiveTab('info');
    const defaultRole = roles.find(r => r.name === 'Team Member') || roles[0];
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: defaultRole?.name || 'Team Member',
      isActive: true
    });
    setShowModal(true);
    setError('');
  };

  const handleEdit = async (user: UserData) => {
    setEditingUser(user);
    setActiveTab('info');
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });

    // Load user roles
    try {
      const response = await apiService.getUserRoles(user.id);
      if (response.success) {
        setUserRoles(response.data);
      }
    } catch (err) {
      console.error('Error loading user roles:', err);
      setUserRoles([]);
    }

    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const response = await apiService.updateUser(editingUser.id, {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: formData.isActive
        });

        if (response.success) {
          await loadUsers();
          setShowModal(false);
        }
      } else {
        const response = await apiService.createUser(formData);

        if (response.success) {
          await loadUsers();
          setShowModal(false);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm(t('users.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        await loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || t('users.deleteError'));
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await apiService.toggleUserStatus(userId);
      if (response.success) {
        await loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || t('users.statusChangeError'));
    }
  };

  const handleToggleRole = async (roleId: string) => {
    if (!editingUser) return;

    const selectedRole = roles.find(r => r.id === roleId);
    if (!selectedRole) return;

    // Vérifier si on essaie de retirer le rôle Administrator au dernier admin
    if (editingUser.role === 'Administrator' && selectedRole.name !== 'Administrator') {
      const adminCount = users.filter(u => ['Administrator', 'admin'].includes(u.role) && u.isActive).length;
      if (adminCount <= 1) {
        setError(t('users.mustHaveOneAdmin'));
        return;
      }
    }

    try {
      // D'abord, retirer tous les rôles actuels
      for (const currentRole of userRoles) {
        await apiService.removeRoleFromUser(editingUser.id, currentRole.id);
      }

      // Puis assigner le nouveau rôle unique
      await apiService.assignRoleToUser(editingUser.id, roleId);
      setUserRoles([selectedRole]);

      // Mettre à jour formData avec le nouveau rôle
      setFormData({ ...formData, role: selectedRole.name });
    } catch (err: any) {
      setError(err.response?.data?.message || t('users.roleManagementError'));
    }
  };

  return (
    <ThemeLayout className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{t('users.title')}</h1>
            <p style={{ color: theme.colors.textSecondary }}>{t('users.subtitle')}</p>
          </div>
          <button
            onClick={handleCreate}
            style={{
              background: theme.colors.accent,
              color: theme.colors.primary
            }}
            className="flex items-center gap-2 px-4 py-2 hover:opacity-90 rounded-lg transition-opacity"
          >
            <Plus className="w-5 h-5" />
            {t('users.newUser')}
          </button>
        </div>

        {/* Users Table */}
        <div
          style={{
            background: theme.colors.glassBackground,
            borderColor: theme.colors.glassBorder,
          }}
          className="backdrop-blur-md rounded-2xl overflow-hidden border"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: theme.colors.accent, borderTopColor: 'transparent' }}
              ></div>
              <p style={{ color: theme.colors.textSecondary }}>{t('common.loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: theme.colors.surface, borderColor: theme.colors.surfaceBorder }} className="border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('users.user')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('common.email')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('users.role')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('common.status')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('common.createdAt')}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody style={{ borderColor: theme.colors.surfaceBorder }} className="divide-y">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ background: 'transparent' }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                            style={{
                              background: theme.colors.accent,
                              color: theme.colors.primary
                            }}
                          >
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.colors.textPrimary }}>{user.firstName} {user.lastName}</p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          style={{
                            backgroundColor: ['Administrator', 'admin'].includes(user.role) ? `${theme.colors.info}20` : `${theme.colors.accent}20`,
                            color: ['Administrator', 'admin'].includes(user.role) ? theme.colors.info : theme.colors.accent
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {['Administrator', 'admin'].includes(user.role) ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          style={{
                            backgroundColor: user.isActive ? `${theme.colors.success}20` : `${theme.colors.error}20`,
                            color: user.isActive ? theme.colors.success : theme.colors.error
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: theme.colors.textSecondary }}>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            style={{ color: user.isActive ? theme.colors.error : theme.colors.success }}
                            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                            title={user.isActive ? t('users.deactivate') : t('users.activate')}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            style={{ color: theme.colors.accent }}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{ color: theme.colors.error }}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: theme.colors.surface,
                  color: theme.colors.textPrimary
                }}
                className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    {editingUser ? t('users.editUser') : t('users.newUser')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ background: theme.colors.surfaceHover }}
                    className="p-2 hover:opacity-80 rounded-lg transition-opacity"
                  >
                    <X className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                  </button>
                </div>

                {error && (
                  <div
                    style={{
                      backgroundColor: `${theme.colors.error}10`,
                      borderColor: `${theme.colors.error}40`,
                      color: theme.colors.error
                    }}
                    className="mb-4 p-4 border rounded-lg text-sm"
                  >
                    {error}
                  </div>
                )}

                {/* Tabs - Only show for editing */}
                {editingUser && (
                  <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: theme.colors.surfaceHover }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('info')}
                      style={{
                        background: activeTab === 'info' ? theme.colors.surface : 'transparent',
                        color: activeTab === 'info' ? theme.colors.textPrimary : theme.colors.textSecondary
                      }}
                      className="flex-1 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                    >
                      {t('users.information')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('roles')}
                      style={{
                        background: activeTab === 'roles' ? theme.colors.surface : 'transparent',
                        color: activeTab === 'roles' ? theme.colors.textPrimary : theme.colors.textSecondary
                      }}
                      className="flex-1 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                    >
                      {t('users.rolesAndPermissions')}
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tab Content - Information */}
                  {(!editingUser || activeTab === 'info') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('common.firstName')}</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            style={{
                              background: theme.colors.surfaceHover,
                              borderColor: theme.colors.surfaceBorder,
                              color: theme.colors.textPrimary
                            }}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('common.lastName')}</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            style={{
                              background: theme.colors.surfaceHover,
                              borderColor: theme.colors.surfaceBorder,
                              color: theme.colors.textPrimary
                            }}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('common.username')}</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          style={{
                            background: theme.colors.surfaceHover,
                            borderColor: theme.colors.surfaceBorder,
                            color: theme.colors.textPrimary
                          }}
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('common.email')}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{
                            background: theme.colors.surfaceHover,
                            borderColor: theme.colors.surfaceBorder,
                            color: theme.colors.textPrimary
                          }}
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                          required
                        />
                      </div>

                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('users.role')}</label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{
                              background: theme.colors.surfaceHover,
                              borderColor: theme.colors.surfaceBorder,
                              color: theme.colors.textPrimary
                            }}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            required
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.name}>
                                {role.name}
                                {role.description && ` - ${role.description}`}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                            {t('users.passwordAutoGenerated')}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>{t('common.status')}</label>
                        <select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                          style={{
                            background: theme.colors.surfaceHover,
                            borderColor: theme.colors.surfaceBorder,
                            color: theme.colors.textPrimary
                          }}
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        >
                          <option value="active">{t('common.active')}</option>
                          <option value="inactive">{t('common.inactive')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Tab Content - Roles & Permissions */}
                  {editingUser && activeTab === 'roles' && (
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textPrimary }}>{t('users.additionalRoles')}</label>
                      <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>{t('users.selectAdditionalRoles')}</p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {roles.map((role) => {
                          const isAssigned = userRoles.some(r => r.id === role.id);
                          return (
                            <div
                              key={role.id}
                              onClick={() => handleToggleRole(role.id)}
                              style={{
                                borderColor: isAssigned ? theme.colors.accent : theme.colors.surfaceBorder,
                                backgroundColor: isAssigned ? `${theme.colors.accent}10` : 'transparent'
                              }}
                              className="p-4 border-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  style={{
                                    borderColor: isAssigned ? theme.colors.accent : theme.colors.surfaceBorder,
                                    backgroundColor: isAssigned ? theme.colors.accent : 'transparent'
                                  }}
                                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                                >
                                  {isAssigned && <Check className="w-4 h-4" style={{ color: theme.colors.primary }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{role.name}</p>
                                    {role.isSystem && (
                                      <span
                                        style={{
                                          backgroundColor: `${theme.colors.info}20`,
                                          color: theme.colors.info
                                        }}
                                        className="px-2 py-0.5 text-xs font-medium rounded flex-shrink-0"
                                      >
                                        {t('users.system')}
                                      </span>
                                    )}
                                  </div>
                                  {role.description && (
                                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{role.description}</p>
                                  )}
                                  <p className="text-xs mt-1" style={{ color: theme.colors.textTertiary }}>
                                    {role.permissions.length} {role.permissions.length > 1 ? t('common.permissions') : t('common.permission')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        borderColor: theme.colors.surfaceBorder,
                        color: theme.colors.textPrimary,
                        background: theme.colors.surfaceHover
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: theme.colors.accent,
                        color: theme.colors.primary
                      }}
                      className="flex-1 px-4 py-2 hover:opacity-90 rounded-lg transition-opacity flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingUser ? t('common.update') : t('common.create')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeLayout>
  );
};

export default Users;