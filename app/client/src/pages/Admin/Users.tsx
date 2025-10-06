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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('users.title')}</h1>
            <p className="text-slate-600">{t('users.subtitle')}</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('users.newUser')}
          </button>
        </div>

        {/* Users Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">{t('users.user')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">{t('common.email')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">{t('users.role')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">{t('common.status')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">{t('common.createdAt')}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          ['Administrator', 'admin'].includes(user.role) ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {['Administrator', 'admin'].includes(user.role) ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'
                            }`}
                            title={user.isActive ? t('users.deactivate') : t('users.activate')}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
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
                className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingUser ? t('users.editUser') : t('users.newUser')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Tabs - Only show for editing */}
                {editingUser && (
                  <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'info'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('users.information')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('roles')}
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'roles'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
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
                          <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.firstName')}</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.lastName')}</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.username')}</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.email')}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">{t('users.role')}</label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.name}>
                                {role.name}
                                {role.description && ` - ${role.description}`}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500 mt-2">
                            {t('users.passwordAutoGenerated')}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.status')}</label>
                        <select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-slate-700 mb-3">{t('users.additionalRoles')}</label>
                      <p className="text-sm text-slate-600 mb-4">{t('users.selectAdditionalRoles')}</p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {roles.map((role) => {
                          const isAssigned = userRoles.some(r => r.id === role.id);
                          return (
                            <div
                              key={role.id}
                              onClick={() => handleToggleRole(role.id)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isAssigned
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isAssigned
                                    ? 'border-purple-600 bg-purple-600'
                                    : 'border-slate-300'
                                }`}>
                                  {isAssigned && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-900">{role.name}</p>
                                    {role.isSystem && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded flex-shrink-0">
                                        {t('users.system')}
                                      </span>
                                    )}
                                  </div>
                                  {role.description && (
                                    <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                                  )}
                                  <p className="text-xs text-slate-500 mt-1">
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
                      className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
};

export default Users;