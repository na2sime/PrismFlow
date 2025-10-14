import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FiX,
  FiAlignLeft,
  FiCheckSquare,
  FiList,
  FiCode,
  FiEye,
  FiEdit3,
  FiCalendar,
  FiUser,
  FiFlag,
  FiTag
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectMembers: any[];
  onTaskCreated: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectMembers,
  onTaskCreated,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(t('tasks.titleRequired') || 'Task title is required');
      return;
    }

    try {
      setLoading(true);
      await apiService.createTask({
        projectId,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || null,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        tags: formData.tags,
      });

      onTaskCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(t('tasks.createError') || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
      estimatedHours: '',
      tags: [],
    });
    setTagInput('');
    setIsMarkdown(false);
    setShowPreview(false);
    onClose();
  };

  const insertTemplate = (template: string) => {
    const templates: Record<string, string> = {
      checklist: '\n\n## Checklist\n- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n',
      list: '\n\n## List\n- Item 1\n- Item 2\n- Item 3\n',
      code: '\n\n```javascript\n// Your code here\n```\n',
      table: '\n\n| Column 1 | Column 2 |\n|----------|----------|\n| Value 1  | Value 2  |\n',
    };

    setFormData({
      ...formData,
      description: formData.description + (templates[template] || ''),
    });
    setIsMarkdown(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'todo', label: t('tasks.status.todo') || 'To Do', color: theme.colors.textSecondary },
    { value: 'in_progress', label: t('tasks.status.inProgress') || 'In Progress', color: theme.colors.info },
    { value: 'review', label: t('tasks.status.review') || 'Review', color: theme.colors.warning },
    { value: 'done', label: t('tasks.status.done') || 'Done', color: theme.colors.success },
  ];

  const priorityOptions = [
    { value: 'low', label: t('tasks.priority.low') || 'Low', color: theme.colors.success },
    { value: 'medium', label: t('tasks.priority.medium') || 'Medium', color: theme.colors.info },
    { value: 'high', label: t('tasks.priority.high') || 'High', color: theme.colors.warning },
    { value: 'critical', label: t('tasks.priority.critical') || 'Critical', color: theme.colors.error },
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
            className="backdrop-blur-xl rounded-2xl p-6 w-full max-w-4xl border shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                {t('tasks.createTask') || 'Create Task'}
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

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  {t('tasks.title')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('tasks.titlePlaceholder') || 'Enter task title...'}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: theme.colors.surfaceHover,
                    borderColor: theme.colors.surfaceBorder,
                    color: theme.colors.textPrimary,
                  }}
                  required
                />
              </div>

              {/* Description with Markdown support */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                    {t('tasks.description')}
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Markdown toggle */}
                    <button
                      type="button"
                      onClick={() => setIsMarkdown(!isMarkdown)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: isMarkdown ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                        color: isMarkdown ? theme.colors.accent : theme.colors.textSecondary,
                        borderColor: theme.colors.surfaceBorder,
                      }}
                    >
                      {React.createElement(FiCode as any, { className: "w-3 h-3" })}
                      Markdown
                    </button>

                    {/* Preview toggle */}
                    {isMarkdown && (
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                        style={{
                          backgroundColor: showPreview ? `${theme.colors.accent}20` : theme.colors.surfaceHover,
                          color: showPreview ? theme.colors.accent : theme.colors.textSecondary,
                        }}
                      >
                        {React.createElement((showPreview ? FiEdit3 : FiEye) as any, { className: "w-3 h-3" })}
                        {showPreview ? t('tasks.edit') : t('tasks.preview')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Template buttons (only in Markdown mode) */}
                {isMarkdown && !showPreview && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => insertTemplate('checklist')}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.colors.surfaceHover,
                        color: theme.colors.textSecondary,
                        borderColor: theme.colors.surfaceBorder,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceBorder;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                    >
                      {React.createElement(FiCheckSquare as any, { className: "w-3 h-3" })}
                      Checklist
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate('list')}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.colors.surfaceHover,
                        color: theme.colors.textSecondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceBorder;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                    >
                      {React.createElement(FiList as any, { className: "w-3 h-3" })}
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate('code')}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.colors.surfaceHover,
                        color: theme.colors.textSecondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceBorder;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                    >
                      {React.createElement(FiCode as any, { className: "w-3 h-3" })}
                      Code
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate('table')}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.colors.surfaceHover,
                        color: theme.colors.textSecondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceBorder;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                    >
                      {React.createElement(FiAlignLeft as any, { className: "w-3 h-3" })}
                      Table
                    </button>
                  </div>
                )}

                {/* Editor / Preview */}
                {showPreview ? (
                  <div
                    className="w-full px-4 py-3 rounded-lg border min-h-[150px] prose prose-sm max-w-none"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        input: ({ node, ...props }) => (
                          <input
                            {...props}
                            type="checkbox"
                            disabled
                            style={{ marginRight: '0.5rem' }}
                          />
                        ),
                      }}
                    >
                      {formData.description || t('tasks.noPreview') || '*No content to preview*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={
                      isMarkdown
                        ? t('tasks.descriptionMarkdownPlaceholder') || 'Use Markdown syntax...\n\n**Bold** *Italic* `code`\n- [ ] Checklist'
                        : t('tasks.descriptionPlaceholder') || 'Enter task description...'
                    }
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 resize-none transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                      fontFamily: isMarkdown ? 'monospace' : 'inherit',
                    }}
                  />
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    {React.createElement(FiFlag as any, { className: "w-4 h-4 inline mr-1" })}
                    {t('tasks.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    {React.createElement(FiFlag as any, { className: "w-4 h-4 inline mr-1" })}
                    {t('tasks.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee and Due Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    {React.createElement(FiUser as any, { className: "w-4 h-4 inline mr-1" })}
                    {t('tasks.assignee')}
                  </label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    <option value="">{t('tasks.unassigned') || 'Unassigned'}</option>
                    {projectMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    {React.createElement(FiCalendar as any, { className: "w-4 h-4 inline mr-1" })}
                    {t('tasks.dueDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  {t('tasks.estimatedHours')}
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: theme.colors.surfaceHover,
                    borderColor: theme.colors.surfaceBorder,
                    color: theme.colors.textPrimary,
                  }}
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  {React.createElement(FiTag as any, { className: "w-4 h-4 inline mr-1" })}
                  {t('tasks.tags')}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t('tasks.addTag') || 'Add a tag...'}
                    className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.surfaceHover,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.primary,
                    }}
                  >
                    {t('common.add')}
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: `${theme.colors.accent}20`,
                          color: theme.colors.accent,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:opacity-70"
                        >
                          {React.createElement(FiX as any, { className: "w-3 h-3" })}
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
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
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 px-4 py-3 rounded-lg transition-all font-medium"
                  style={{
                    backgroundColor: !loading && formData.title.trim() ? theme.colors.accent : theme.colors.surfaceBorder,
                    color: theme.colors.primary,
                    opacity: !loading && formData.title.trim() ? 1 : 0.5,
                    cursor: !loading && formData.title.trim() ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && formData.title.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && formData.title.trim()) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {loading ? t('common.creating') : t('tasks.createTask')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;