import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, X, Check, AlertCircle } from 'lucide-react';

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

// Permission groups
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Utilisateurs',
    permissions: [
      { key: 'users:view', label: 'Voir les utilisateurs' },
      { key: 'users:create', label: 'Créer des utilisateurs' },
      { key: 'users:edit', label: 'Modifier les utilisateurs' },
      { key: 'users:delete', label: 'Supprimer les utilisateurs' },
      { key: 'users:manage_roles', label: 'Gérer les rôles' }
    ]
  },
  {
    name: 'Projets',
    permissions: [
      { key: 'projects:view_all', label: 'Voir tous les projets' },
      { key: 'projects:view_own', label: 'Voir ses propres projets' },
      { key: 'projects:create', label: 'Créer des projets' },
      { key: 'projects:edit', label: 'Modifier les projets' },
      { key: 'projects:delete', label: 'Supprimer les projets' },
      { key: 'projects:archive', label: 'Archiver les projets' }
    ]
  },
  {
    name: 'Tâches',
    permissions: [
      { key: 'tasks:view_all', label: 'Voir toutes les tâches' },
      { key: 'tasks:view_own', label: 'Voir ses propres tâches' },
      { key: 'tasks:create', label: 'Créer des tâches' },
      { key: 'tasks:edit', label: 'Modifier les tâches' },
      { key: 'tasks:delete', label: 'Supprimer les tâches' },
      { key: 'tasks:assign', label: 'Assigner des tâches' }
    ]
  },
  {
    name: 'Équipes',
    permissions: [
      { key: 'teams:view', label: 'Voir les équipes' },
      { key: 'teams:create', label: 'Créer des équipes' },
      { key: 'teams:edit', label: 'Modifier les équipes' },
      { key: 'teams:delete', label: 'Supprimer les équipes' },
      { key: 'teams:manage_members', label: 'Gérer les membres' }
    ]
  },
  {
    name: 'Boards',
    permissions: [
      { key: 'boards:view', label: 'Voir les boards' },
      { key: 'boards:create', label: 'Créer des boards' },
      { key: 'boards:edit', label: 'Modifier les boards' },
      { key: 'boards:delete', label: 'Supprimer les boards' }
    ]
  },
  {
    name: 'Administration',
    permissions: [
      { key: 'admin:access', label: 'Accès admin' },
      { key: 'admin:settings', label: 'Paramètres système' },
      { key: 'admin:roles', label: 'Gestion des rôles' },
      { key: 'admin:logs', label: 'Logs système' }
    ]
  },
  {
    name: 'Rapports',
    permissions: [
      { key: 'reports:view', label: 'Voir les rapports' },
      { key: 'reports:export', label: 'Exporter les rapports' }
    ]
  }
];

const Roles: React.FC = () => {
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
      setError('Erreur lors du chargement des rôles');
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
      setError('Le nom du rôle est requis');
      return;
    }

    if (formData.permissions.length === 0) {
      setError('Au moins une permission doit être sélectionnée');
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
      setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement du rôle');
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      await apiService.deleteRole(roleId);
      await fetchRoles();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression du rôle');
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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            Rôles & Permissions
          </h1>
          <p className="text-slate-600 mt-1">Gérez les rôles et leurs permissions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau rôle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{role.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">
                    {role.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">
                    {role.permissions.length} permission{role.permissions.length > 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {role.isSystem ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Système
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Personnalisé
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(role)}
                    disabled={role.isSystem}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      role.isSystem
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title={role.isSystem ? 'Les rôles système ne peuvent pas être modifiés' : 'Modifier'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {deleteConfirm === role.id ? (
                    <div className="inline-flex items-center gap-2">
                      <span className="text-sm text-slate-600">Confirmer?</span>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(role.id)}
                      disabled={role.isSystem}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        role.isSystem
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={role.isSystem ? 'Les rôles système ne peuvent pas être supprimés' : 'Supprimer'}
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
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="p-6 space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom du rôle *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Chef de projet junior"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Description du rôle..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Permissions * ({formData.permissions.length} sélectionnée{formData.permissions.length > 1 ? 's' : ''})
                    </label>
                    <div className="space-y-4">
                      {PERMISSION_GROUPS.map((group) => {
                        const groupPermissionKeys = group.permissions.map(p => p.key);
                        const allSelected = groupPermissionKeys.every(p => formData.permissions.includes(p));
                        const someSelected = groupPermissionKeys.some(p => formData.permissions.includes(p));

                        return (
                          <div key={group.name} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => toggleGroupPermissions(group)}
                                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                              />
                              <label className="font-semibold text-slate-900 cursor-pointer select-none" onClick={() => toggleGroupPermissions(group)}>
                                {group.name}
                                {someSelected && !allSelected && (
                                  <span className="ml-2 text-xs text-purple-600 font-normal">
                                    (partiel)
                                  </span>
                                )}
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 ml-6">
                              {group.permissions.map((permission) => (
                                <label
                                  key={permission.key}
                                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(permission.key)}
                                    onChange={() => togglePermission(permission.key)}
                                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
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

                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingRole ? 'Mettre à jour' : 'Créer le rôle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roles;
