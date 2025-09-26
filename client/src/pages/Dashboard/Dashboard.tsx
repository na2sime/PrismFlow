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
import './Dashboard.css';

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
  return (
    <motion.div
      className="stat-card glass"
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
      <div className="stat-card-header">
        <div className="stat-icon">
          <Icon size={24} />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{value}</div>
        </div>
      </div>
      <div className={`stat-change ${changeType}`}>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h1 className="dashboard-title">Good morning, John! 👋</h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Calendar size={20} />
            View Calendar
          </button>
          <button className="btn btn-primary">
            <Activity size={20} />
            Quick Report
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Projects */}
        <motion.div
          className="dashboard-section glass"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <button className="btn-link">View All</button>
          </div>
          <div className="projects-list">
            {recentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="project-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                  <div className="project-meta">
                    <span className="project-members">
                      <Users size={16} />
                      {project.members} members
                    </span>
                    <span className="project-due">
                      Due {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="project-progress">
                  <div className="progress-text">{project.progress}%</div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="dashboard-section glass"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Folder size={24} />
              <span>New Project</span>
            </motion.button>
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle size={24} />
              <span>Add Task</span>
            </motion.button>
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users size={24} />
              <span>Invite Team</span>
            </motion.button>
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 size={24} />
              <span>View Reports</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;