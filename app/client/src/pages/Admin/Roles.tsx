import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, X, Check, AlertCircle } from 'lucide-react';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface PermissionGroup {
  name: string;
  permissions: {
    key: string;
    label: string;
  }[];
}

const Roles: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Permission groups
  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      name: t('roles.permissionGroups.users'),
      permissions: [
        { key: 'users:view', label: t('roles.permissions.users:view') },
        { key: 'users:create', label: t('roles.permissions.users:create') },
        { key: 'users:edit', label: t('roles.permissions.users:edit') },
        { key: 'users:delete', label: t('roles.permissions.users:delete') },
        { key: 'users:manage_roles', label: t('roles.permissions.users:manage_roles') }
      ]
    },
    {
      name: t('roles.permissionGroups.projects'),
      permissions: [
        { key: 'projects:view_all', label: t('roles.permissions.projects:view_all') },
        { key: 'projects:view_own', label: t('roles.permissions.projects:view_own') },
        { key: 'projects:create', label: t('roles.permissions.projects:create') },
        { key: 'projects:edit', label: t('roles.permissions.projects:edit') },
        { key: 'projects:delete', label: t('roles.permissions.projects:delete') },
        { key: 'projects:archive', label: t('roles.permissions.projects:archive') }
      ]
    },
    {
      name: t('roles.permissionGroups.tasks'),
      permissions: [
        { key: 'tasks:view_all', label: t('roles.permissions.tasks:view_all') },
        { key: 'tasks:view_own', label: t('roles.permissions.tasks:view_own') },
        { key: 'tasks:create', label: t('roles.permissions.tasks:create') },
        { key: 'tasks:edit', label: t('roles.permissions.tasks:edit') },
        { key: 'tasks:delete', label: t('roles.permissions.tasks:delete') },
        { key: 'tasks:assign', label: t('roles.permissions.tasks:assign') }
      ]
    },
    {
      name: t('roles.permissionGroups.teams'),
      permissions: [
        { key: 'teams:view', label: t('roles.permissions.teams:view') },
        { key: 'teams:create', label: t('roles.permissions.teams:create') },
        { key: 'teams:edit', label: t('roles.permissions.teams:edit') },
        { key: 'teams:delete', label: t('roles.permissions.teams:delete') },
        { key: 'teams:manage_members', label: t('roles.permissions.teams:manage_members') }
      ]
    },
    {
      name: t('roles.permissionGroups.boards'),
      permissions: [
        { key: 'boards:view', label: t('roles.permissions.boards:view') },
        { key: 'boards:create', label: t('roles.permissions.boards:create') },
        { key: 'boards:edit', label: t('roles.permissions.boards:edit') },
        { key: 'boards:delete', label: t('roles.permissions.boards:delete') }
      ]
    },
    {
      name: t('roles.permissionGroups.administration'),
      permissions: [
        { key: 'admin:access', label: t('roles.permissions.admin:access') },
        { key: 'admin:settings', label: t('roles.permissions.admin:settings') },
        { key: 'admin:roles', label: t('roles.permissions.admin:roles') },
        { key: 'admin:logs', label: t('roles.permissions.admin:logs') }
      ]
    },
    {
      name: t('roles.permissionGroups.reports'),
      permissions: [
        { key: 'reports:view', label: t('roles.permissions.reports:view') },
        { key: 'reports:export', label: t('roles.permissions.reports:export') }
      ]
    }
  ];

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setError(t('roles.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: [...role.permissions]
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(t('roles.roleNameRequired'));
      return;
    }

    if (formData.permissions.length === 0) {
      setError(t('roles.permissionsRequired'));
      return;
    }

    try {
      if (editingRole) {
        await apiService.updateRole(editingRole.id, formData);
      } else {
        await apiService.createRole(formData);
      }
      await fetchRoles();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving role:', error);
      setError(error.response?.data?.message || t('roles.saveError'));
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      await apiService.deleteRole(roleId);
      await fetchRoles();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      setError(error.response?.data?.message || t('roles.deleteError'));
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const groupPermissionKeys = group.permissions.map(p => p.key);
    const allSelected = groupPermissionKeys.every(p => formData.permissions.includes(p));

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPermissionKeys.includes(p))
        : Array.from(new Set([...prev.permissions, ...groupPermissionKeys]))
    }));
  };

  if (loading) {
    return (
      <ThemeLayout className="p-8">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: theme.colors.accent, borderTopColor: 'transparent' }}
          ></div>
        </div>
      </ThemeLayout>
    );
  }

  return (
    <ThemeLayout className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
            <Shield className="w-8 h-8" style={{ color: theme.colors.accent }} />
            {t('roles.title')}
          </h1>
          <p className="mt-1" style={{ color: theme.colors.textSecondary }}>{t('roles.subtitle')}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{
            background: theme.colors.accent,
            color: theme.colors.primary
          }}
        >
          <Plus className="w-5 h-5" />
          {t('roles.newRole')}
        </button>
      </div>

      {error && (
        <div
          className="mb-4 p-4 border rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: `${theme.colors.error}10`,
            borderColor: `${theme.colors.error}40`,
            color: theme.colors.error
          }}
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div
        className="rounded-lg shadow-sm border"
        style={{
          background: theme.colors.glassBackground,
          borderColor: theme.colors.glassBorder
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{
                background: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder
              }}
            >
              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textPrimary }}
              >
                {t('users.role')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textPrimary }}
              >
                {t('common.description')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textPrimary }}
              >
                {t('common.permissions')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textPrimary }}
              >
                {t('common.type')}
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textPrimary }}
              >
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: theme.colors.surfaceBorder }}>
            {roles.map((role) => (
              <tr key={role.id} className="hover:opacity-80 transition-opacity">
                <td className="px-6 py-4">
                  <div className="font-medium" style={{ color: theme.colors.textPrimary }}>{role.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {role.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {t('roles.permissionsCount', { count: role.permissions.length })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {role.isSystem ? (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${theme.colors.info}20`,
                        color: theme.colors.info
                      }}
                    >
                      {t('users.system')}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${theme.colors.textSecondary}20`,
                        color: theme.colors.textSecondary
                      }}
                    >
                      {t('users.customRole')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(role)}
                    disabled={role.name === 'Administrator'}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{
                      color: role.name === 'Administrator' ? theme.colors.textTertiary : theme.colors.accent,
                      cursor: role.name === 'Administrator' ? 'not-allowed' : 'pointer'
                    }}
                    title={role.name === 'Administrator' ? t('roles.systemRoleEditDisabled') : t('common.edit')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {deleteConfirm === role.id ? (
                    <div className="inline-flex items-center gap-2">
                      <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{t('roles.confirmDelete')}</span>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        style={{
                          background: theme.colors.error,
                          color: theme.colors.primary
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                        style={{
                          background: theme.colors.surfaceHover,
                          color: theme.colors.textPrimary
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(role.id)}
                      disabled={role.name === 'Administrator'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                      style={{
                        color: role.name === 'Administrator' ? theme.colors.textTertiary : theme.colors.error,
                        cursor: role.name === 'Administrator' ? 'not-allowed' : 'pointer'
                      }}
                      title={role.name === 'Administrator' ? t('roles.systemRoleDeleteDisabled') : t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              style={{
                background: theme.colors.surface
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: theme.colors.surfaceBorder }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {editingRole ? t('roles.editRole') : t('roles.newRole')}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="p-6 space-y-6">
                  {error && (
                    <div
                      className="p-4 border rounded-lg flex items-center gap-2"
                      style={{
                        backgroundColor: `${theme.colors.error}10`,
                        borderColor: `${theme.colors.error}40`,
                        color: theme.colors.error
                      }}
                    >
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t('roles.roleName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        background: theme.colors.surfaceHover,
                        borderColor: theme.colors.surfaceBorder,
                        color: theme.colors.textPrimary
                      }}
                      placeholder={t('roles.roleNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t('common.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        background: theme.colors.surfaceHover,
                        borderColor: theme.colors.surfaceBorder,
                        color: theme.colors.textPrimary
                      }}
                      placeholder={t('roles.descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t('roles.permissionsCount', { count: formData.permissions.length })}
                    </label>
                    <div className="space-y-4">
                      {PERMISSION_GROUPS.map((group) => {
                        const groupPermissionKeys = group.permissions.map(p => p.key);
                        const allSelected = groupPermissionKeys.every(p => formData.permissions.includes(p));
                        const someSelected = groupPermissionKeys.some(p => formData.permissions.includes(p));

                        return (
                          <div
                            key={group.name}
                            className="border rounded-lg p-4"
                            style={{
                              borderColor: theme.colors.surfaceBorder,
                              background: theme.colors.surface
                            }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => toggleGroupPermissions(group)}
                                className="w-4 h-4 rounded focus:ring-2"
                                style={{
                                  accentColor: theme.colors.accent
                                }}
                              />
                              <label
                                className="font-semibold cursor-pointer select-none"
                                style={{ color: theme.colors.textPrimary }}
                                onClick={() => toggleGroupPermissions(group)}
                              >
                                {group.name}
                                {someSelected && !allSelected && (
                                  <span
                                    className="ml-2 text-xs font-normal"
                                    style={{ color: theme.colors.accent }}
                                  >
                                    ({t('roles.partial')})
                                  </span>
                                )}
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 ml-6">
                              {group.permissions.map((permission) => (
                                <label
                                  key={permission.key}
                                  className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80"
                                  style={{ color: theme.colors.textSecondary }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(permission.key)}
                                    onChange={() => togglePermission(permission.key)}
                                    className="w-4 h-4 rounded focus:ring-2"
                                    style={{
                                      accentColor: theme.colors.accent
                                    }}
                                  />
                                  {permission.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="p-6 border-t flex justify-end gap-3"
                  style={{ borderColor: theme.colors.surfaceBorder }}
                >
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
                    style={{
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                      background: theme.colors.surfaceHover
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    style={{
                      background: theme.colors.accent,
                      color: theme.colors.primary
                    }}
                  >
                    {editingRole ? t('common.update') : t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeLayout>
  );
};

export default Roles;