import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Users,
  Folder,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  delay
}) => {
  const { theme } = useTheme();

  const changeColors = {
    positive: theme.colors.success,
    negative: theme.colors.error,
    neutral: theme.colors.textSecondary
  };

  return (
    <motion.div
      style={{
        background: theme.colors.glassBackground,
        borderColor: theme.colors.glassBorder,
      }}
      className="backdrop-blur-md rounded-2xl p-6 hover:shadow-2xl transition-shadow border"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${theme.colors.accent}20`,
            color: theme.colors.accent
          }}
        >
          <Icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>{title}</h3>
        <div className="text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{value}</div>
      </div>
      <div className="flex items-center gap-1 text-sm" style={{ color: changeColors[changeType] }}>
        <TrendingUp size={16} />
        <span>{change}</span>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const stats = [
    {
      icon: Folder,
      title: t('dashboard.stats.activeProjects'),
      value: '12',
      change: t('dashboard.changes.thisMonth', { count: 2 }),
      changeType: 'positive' as const
    },
    {
      icon: CheckCircle,
      title: t('dashboard.stats.completedTasks'),
      value: '147',
      change: t('dashboard.changes.thisWeek', { count: 23 }),
      changeType: 'positive' as const
    },
    {
      icon: Clock,
      title: t('dashboard.stats.inProgress'),
      value: '38',
      change: t('dashboard.changes.today', { count: 5 }),
      changeType: 'positive' as const
    },
    {
      icon: Users,
      title: t('dashboard.stats.teamMembers'),
      value: '8',
      change: t('dashboard.changes.thisMonth', { count: 1 }),
      changeType: 'positive' as const
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'PrismFlow Dashboard',
      progress: 85,
      members: 4,
      dueDate: '2024-02-15'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      progress: 62,
      members: 3,
      dueDate: '2024-03-01'
    },
    {
      id: 3,
      name: 'API Integration',
      progress: 94,
      members: 2,
      dueDate: '2024-01-30'
    }
  ];

  return (
    <ThemeLayout className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{t('dashboard.greeting', { name: 'John' })}</h1>
              <p style={{ color: theme.colors.textSecondary }}>
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                style={{
                  background: theme.colors.surface,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.surfaceBorder
                }}
                className="px-4 py-2 hover:opacity-80 rounded-lg border transition-colors flex items-center gap-2"
              >
                <Calendar size={20} />
                {t('dashboard.buttons.viewCalendar')}
              </button>
              <button
                style={{
                  background: theme.colors.accent,
                  color: theme.colors.primary
                }}
                className="px-4 py-2 hover:opacity-90 rounded-lg transition-colors flex items-center gap-2"
              >
                <Activity size={20} />
                {t('dashboard.buttons.quickReport')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <motion.div
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            className="lg:col-span-2 backdrop-blur-md rounded-2xl p-6 border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{t('dashboard.recentProjects')}</h2>
              <button
                style={{ color: theme.colors.accent }}
                className="hover:opacity-80 text-sm font-medium transition-opacity"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  style={{
                    background: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder
                  }}
                  className="p-4 rounded-xl hover:opacity-80 transition-opacity cursor-pointer border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm" style={{ color: theme.colors.textSecondary }}>
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {project.members} {t('dashboard.members')}
                        </span>
                        <span>
                          {t('dashboard.due')} {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>{project.progress}%</div>
                    </div>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${theme.colors.textSecondary}40` }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
            className="backdrop-blur-md rounded-2xl p-6 border"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>{t('dashboard.quickActions.title')}</h2>
            <div className="space-y-3">
              <motion.button
                style={{
                  background: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder
                }}
                className="w-full p-4 hover:opacity-80 rounded-xl transition-opacity flex items-center gap-3 text-left border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.accent}20`,
                    color: theme.colors.accent
                  }}
                >
                  <Folder size={20} />
                </div>
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{t('dashboard.quickActions.newProject')}</span>
              </motion.button>
              <motion.button
                style={{
                  background: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder
                }}
                className="w-full p-4 hover:opacity-80 rounded-xl transition-opacity flex items-center gap-3 text-left border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.success}20`,
                    color: theme.colors.success
                  }}
                >
                  <CheckCircle size={20} />
                </div>
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{t('dashboard.quickActions.addTask')}</span>
              </motion.button>
              <motion.button
                style={{
                  background: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder
                }}
                className="w-full p-4 hover:opacity-80 rounded-xl transition-opacity flex items-center gap-3 text-left border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.info}20`,
                    color: theme.colors.info
                  }}
                >
                  <Users size={20} />
                </div>
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{t('dashboard.quickActions.inviteTeam')}</span>
              </motion.button>
              <motion.button
                style={{
                  background: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder
                }}
                className="w-full p-4 hover:opacity-80 rounded-xl transition-opacity flex items-center gap-3 text-left border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.warning}20`,
                    color: theme.colors.warning
                  }}
                >
                  <BarChart3 size={20} />
                </div>
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{t('dashboard.quickActions.viewReports')}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </ThemeLayout>
  );
};

export default Dashboard;
