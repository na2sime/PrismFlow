import React from 'react';
import { motion } from 'framer-motion';
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
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-slate-600'
  };

  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:shadow-2xl transition-shadow"
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
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      </div>
      <div className={`flex items-center gap-1 text-sm ${changeColors[changeType]}`}>
        <TrendingUp size={16} />
        <span>{change}</span>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const stats = [
    {
      icon: Folder,
      title: 'Active Projects',
      value: '12',
      change: '+2 this month',
      changeType: 'positive' as const
    },
    {
      icon: CheckCircle,
      title: 'Completed Tasks',
      value: '147',
      change: '+23 this week',
      changeType: 'positive' as const
    },
    {
      icon: Clock,
      title: 'In Progress',
      value: '38',
      change: '+5 today',
      changeType: 'positive' as const
    },
    {
      icon: Users,
      title: 'Team Members',
      value: '8',
      change: '+1 this month',
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
    <div className="min-h-screen p-8">
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
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Good morning, John! 👋</h1>
              <p className="text-slate-600">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-2">
                <Calendar size={20} />
                View Calendar
              </button>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                <Activity size={20} />
                Quick Report
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
            className="lg:col-span-2 glass rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {project.members} members
                        </span>
                        <span>
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900 mb-1">{project.progress}%</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
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
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <motion.button
                className="w-full p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-3 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Folder size={20} />
                </div>
                <span className="font-medium text-slate-900">New Project</span>
              </motion.button>
              <motion.button
                className="w-full p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-3 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <span className="font-medium text-slate-900">Add Task</span>
              </motion.button>
              <motion.button
                className="w-full p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-3 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span className="font-medium text-slate-900">Invite Team</span>
              </motion.button>
              <motion.button
                className="w-full p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-3 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <span className="font-medium text-slate-900">View Reports</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
