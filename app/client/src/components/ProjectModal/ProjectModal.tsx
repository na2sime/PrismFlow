import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { apiService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

// Wrapper to fix React 19 icon type issues
const IconX = (props: any) => FiX(props) as any;

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  taskCount?: number;
  memberCount?: number;
  settings?: {
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

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const PRESET_ICONS = ['📁', '🚀', '💼', '🎯', '⭐', '🔥', '💡', '🎨', '📊', '🛠️', '📱', '🌟'];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, project, onClose, onSave }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
    status: 'active' as 'active' | 'archived' | 'completed',
    boardLayout: 'kanban' as 'scrum' | 'kanban' | 'list' | 'calendar',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        color: project.settings?.color || PRESET_COLORS[0],
        icon: project.settings?.icon || PRESET_ICONS[0],
        status: project.settings?.status || 'active',
        boardLayout: project.settings?.boardLayout || 'kanban',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0],
        status: 'active',
        boardLayout: 'kanban',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('projects.modal.errors.nameRequired');
    } else if (formData.name.length > 100) {
      newErrors.name = t('projects.modal.errors.nameTooLong');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('projects.modal.errors.descriptionTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Format data to match server schema
      const projectPayload = {
        name: formData.name,
        description: formData.description,
        settings: {
          visibility: 'private' as const,
          allowGuests: false,
          boardLayout: formData.boardLayout,
          color: formData.color,
          icon: formData.icon,
          status: formData.status,
        }
      };

      if (project) {
        await apiService.updateProject(project.id, projectPayload);
      } else {
        await apiService.createProject(projectPayload);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving project:', error);
      setErrors({
        submit: error.response?.data?.error || t('projects.modal.errors.saveFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: theme.colors.surfaceBorder }}
            >
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {project ? t('projects.modal.editTitle') : t('projects.modal.createTitle')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: theme.colors.textSecondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
              >
                <IconX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('projects.modal.name')} <span style={{ color: theme.colors.error }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{
                    backgroundColor: theme.colors.surfaceHover,
                    borderColor: errors.name ? theme.colors.error : theme.colors.surfaceBorder,
                    color: theme.colors.textPrimary,
                  }}
                  placeholder={t('projects.modal.namePlaceholder')}
                />
                {errors.name && <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('projects.modal.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none transition"
                  style={{
                    backgroundColor: theme.colors.surfaceHover,
                    borderColor: errors.description ? theme.colors.error : theme.colors.surfaceBorder,
                    color: theme.colors.textPrimary,
                  }}
                  placeholder={t('projects.modal.descriptionPlaceholder')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>{errors.description}</p>
                )}
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    {t('projects.modal.icon')}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleChange('icon', icon)}
                        className="w-full aspect-square rounded-lg text-2xl flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: formData.icon === icon ? theme.colors.accent : theme.colors.surfaceHover,
                          transform: formData.icon === icon ? 'scale(1.1)' : 'scale(1)',
                        }}
                        onMouseEnter={(e) => {
                          if (formData.icon !== icon) {
                            e.currentTarget.style.backgroundColor = theme.colors.surface;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.icon !== icon) {
                            e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                          }
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    {t('projects.modal.color')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange('color', color)}
                        className="w-full aspect-square rounded-lg transition-all"
                        style={{
                          backgroundColor: color,
                          transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: formData.color === color ? `0 0 0 2px ${theme.colors.textPrimary}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Board Layout */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('projects.modal.boardLayout')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'scrum', label: 'Scrum', icon: '🏃' },
                    { value: 'kanban', label: 'Kanban', icon: '📋' },
                    { value: 'list', label: 'List', icon: '📝' },
                  ].map((layout) => (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => handleChange('boardLayout', layout.value)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: formData.boardLayout === layout.value ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                        borderColor: formData.boardLayout === layout.value ? theme.colors.accent : theme.colors.surfaceBorder,
                      }}
                      onMouseEnter={(e) => {
                        if (formData.boardLayout !== layout.value) {
                          e.currentTarget.style.backgroundColor = theme.colors.surface;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.boardLayout !== layout.value) {
                          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        }
                      }}
                    >
                      <span className="text-3xl">{layout.icon}</span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: formData.boardLayout === layout.value ? theme.colors.accent : theme.colors.textSecondary,
                        }}
                      >
                        {layout.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('projects.modal.preview')}
                </label>
                <div
                  className="rounded-lg p-4 flex items-center gap-4"
                  style={{ backgroundColor: theme.colors.surfaceHover }}
                >
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                      {formData.name || t('projects.modal.namePlaceholder')}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      {formData.description || t('projects.modal.descriptionPlaceholder')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status (Edit only) */}
              {project && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    {t('projects.modal.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleChange('status', e.target.value as 'active' | 'archived' | 'completed')
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    <option value="active">{t('projects.status.active')}</option>
                    <option value="completed">{t('projects.status.completed')}</option>
                    <option value="archived">{t('projects.status.archived')}</option>
                  </select>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: `${theme.colors.error}10`,
                    borderColor: theme.colors.error,
                  }}
                >
                  <p className="text-sm" style={{ color: theme.colors.error }}>{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-4 pt-4 border-t"
                style={{ borderColor: theme.colors.surfaceBorder }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = theme.colors.accentHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.accent;
                  }}
                >
                  {loading
                    ? t('common.saving')
                    : project
                    ? t('common.save')
                    : t('projects.modal.create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
