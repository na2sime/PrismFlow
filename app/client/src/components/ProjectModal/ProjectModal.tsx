import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { apiService } from '../../services/api';

// Wrapper to fix React 19 icon type issues
const IconX = (props: any) => FiX(props) as any;

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
    status: 'active' as 'active' | 'archived' | 'completed',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        color: project.color,
        icon: project.icon,
        status: project.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0],
        status: 'active',
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
      if (project) {
        await apiService.updateProject(project.id, formData);
      } else {
        await apiService.createProject(formData);
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
            className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {project ? t('projects.modal.editTitle') : t('projects.modal.createTitle')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IconX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('projects.modal.name')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder={t('projects.modal.namePlaceholder')}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('projects.modal.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 bg-gray-700 border ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  placeholder={t('projects.modal.descriptionPlaceholder')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('projects.modal.icon')}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleChange('icon', icon)}
                        className={`w-full aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                          formData.icon === icon
                            ? 'bg-blue-500 scale-110'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('projects.modal.color')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange('color', color)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          formData.color === color ? 'scale-110 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('projects.modal.preview')}
                </label>
                <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {formData.name || t('projects.modal.namePlaceholder')}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {formData.description || t('projects.modal.descriptionPlaceholder')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status (Edit only) */}
              {project && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('projects.modal.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleChange('status', e.target.value as 'active' | 'archived' | 'completed')
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">{t('projects.status.active')}</option>
                    <option value="completed">{t('projects.status.completed')}</option>
                    <option value="archived">{t('projects.status.archived')}</option>
                  </select>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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