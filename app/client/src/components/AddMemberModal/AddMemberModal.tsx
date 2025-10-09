import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiSearch, FiUserPlus, FiShield, FiEye } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberAdded: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setSearching(true);
      const response = await apiService.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await apiService.addProjectMember(projectId, selectedUser.id, selectedRole);
      onMemberAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(t('projectDetail.members.addError') || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setSelectedRole('member');
    setFilteredUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  const roleOptions = [
    {
      value: 'member' as const,
      label: t('projectDetail.members.roleMember') || 'Member',
      icon: FiUserPlus,
      description: t('projectDetail.members.roleMemberDesc') || 'Can view and edit tasks',
    },
    {
      value: 'viewer' as const,
      label: t('projectDetail.members.roleViewer') || 'Viewer',
      icon: FiEye,
      description: t('projectDetail.members.roleViewerDesc') || 'Can only view project',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl border shadow-2xl"
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {t('projectDetail.members.addMemberTitle') || 'Add Team Member'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {React.createElement(FiX as any, { className: "w-6 h-6" })}
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                {t('projectDetail.members.searchUser') || 'Search User'}
              </label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: theme.colors.textTertiary }}
                >
                  {React.createElement(FiSearch as any, { className: "w-5 h-5" })}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('projectDetail.members.searchPlaceholder') || 'Search by name, username or email...'}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors"
                  style={{
                    backgroundColor: theme.colors.surfaceHover,
                    borderColor: theme.colors.surfaceBorder,
                    color: theme.colors.textPrimary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.surfaceBorder;
                  }}
                />
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mb-6 max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: theme.colors.accent }}
                    ></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8" style={{ color: theme.colors.textTertiary }}>
                    {t('projectDetail.members.noUsersFound') || 'No users found'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => {
                      const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
                      const isSelected = selectedUser?.id === user.id;

                      return (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all"
                          style={{
                            backgroundColor: isSelected ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                            borderColor: isSelected ? theme.colors.accent : theme.colors.surfaceBorder,
                          }}
                        >
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
                            style={{
                              backgroundColor: `${theme.colors.accent}20`,
                              color: theme.colors.accent,
                            }}
                          >
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 text-left">
                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                              @{user.username} • {user.email}
                            </div>
                          </div>

                          {/* Selected Indicator */}
                          {isSelected && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Role Selection */}
            {selectedUser && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>
                  {t('projectDetail.members.selectRole') || 'Select Role'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;

                    return (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className="flex flex-col items-start gap-2 p-4 rounded-lg border transition-all"
                        style={{
                          backgroundColor: isSelected ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                          borderColor: isSelected ? theme.colors.accent : theme.colors.surfaceBorder,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {React.createElement(Icon as any, {
                            className: "w-5 h-5",
                            style: { color: isSelected ? theme.colors.accent : theme.colors.textSecondary },
                          })}
                          <span
                            className="font-semibold"
                            style={{ color: isSelected ? theme.colors.accent : theme.colors.textPrimary }}
                          >
                            {role.label}
                          </span>
                        </div>
                        <p className="text-xs text-left" style={{ color: theme.colors.textTertiary }}>
                          {role.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg border transition-colors font-medium"
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
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium"
                style={{
                  backgroundColor: selectedUser && !loading ? theme.colors.accent : theme.colors.surfaceBorder,
                  color: theme.colors.primary,
                  opacity: selectedUser && !loading ? 1 : 0.5,
                  cursor: selectedUser && !loading ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (selectedUser && !loading) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedUser && !loading) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {loading ? t('common.saving') : t('projectDetail.members.addMember')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberModal;
