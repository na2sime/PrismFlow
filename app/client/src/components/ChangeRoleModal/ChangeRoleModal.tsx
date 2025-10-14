import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiUserPlus, FiEye } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'member' | 'viewer';
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string | null;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ProjectMember | null;
  projectId: string;
  onRoleChanged: () => void;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  onClose,
  member,
  projectId,
  onRoleChanged,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'member' | 'viewer'>(
    member?.role === 'viewer' ? 'viewer' : 'member'
  );
  const [loading, setLoading] = useState(false);

  const handleChangeRole = async () => {
    if (!member) return;

    try {
      setLoading(true);
      await apiService.updateProjectMemberRole(projectId, member.userId, selectedRole);
      onRoleChanged();
      onClose();
    } catch (error) {
      console.error('Error changing member role:', error);
      alert(t('projectDetail.members.changeRoleError') || 'Failed to change member role');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

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
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border shadow-2xl"
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {t('projectDetail.members.changeRoleTitle') || 'Change Member Role'}
              </h2>
              <button
                onClick={onClose}
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

            {/* Member Info */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: theme.colors.surfaceHover }}>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0"
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
                    `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() ||
                    member.username?.[0]?.toUpperCase() ||
                    '?'
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    @{member.username}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>
                {t('projectDetail.members.selectNewRole') || 'Select New Role'}
              </label>
              <div className="space-y-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className="w-full flex items-start gap-3 p-4 rounded-lg border transition-all"
                      style={{
                        backgroundColor: isSelected ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                        borderColor: isSelected ? theme.colors.accent : theme.colors.surfaceBorder,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? theme.colors.accent : `${theme.colors.textSecondary}20`,
                          color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                        }}
                      >
                        {React.createElement(Icon as any, { className: "w-5 h-5" })}
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className="font-semibold mb-1"
                          style={{ color: isSelected ? theme.colors.accent : theme.colors.textPrimary }}
                        >
                          {role.label}
                        </div>
                        <p className="text-sm" style={{ color: theme.colors.textTertiary }}>
                          {role.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
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
                onClick={handleChangeRole}
                disabled={loading || selectedRole === member.role}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium"
                style={{
                  backgroundColor: !loading && selectedRole !== member.role ? theme.colors.accent : theme.colors.surfaceBorder,
                  color: theme.colors.primary,
                  opacity: !loading && selectedRole !== member.role ? 1 : 0.5,
                  cursor: !loading && selectedRole !== member.role ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (!loading && selectedRole !== member.role) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && selectedRole !== member.role) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {loading ? t('common.saving') : t('projectDetail.members.changeRole')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangeRoleModal;