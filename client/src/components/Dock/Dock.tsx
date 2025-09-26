import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Folder,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Users,
  Calendar
} from 'lucide-react';
import './Dock.css';

interface DockItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

const Dock: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>('dashboard');

  const dockItems: DockItem[] = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Dashboard',
      active: activeItem === 'dashboard',
      onClick: () => setActiveItem('dashboard')
    },
    {
      id: 'projects',
      icon: Folder,
      label: 'Projects',
      active: activeItem === 'projects',
      onClick: () => setActiveItem('projects'),
      badge: 3
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      label: 'Tasks',
      active: activeItem === 'tasks',
      onClick: () => setActiveItem('tasks'),
      badge: 7
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Calendar',
      active: activeItem === 'calendar',
      onClick: () => setActiveItem('calendar')
    },
    {
      id: 'team',
      icon: Users,
      label: 'Team',
      active: activeItem === 'team',
      onClick: () => setActiveItem('team')
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      active: activeItem === 'analytics',
      onClick: () => setActiveItem('analytics')
    },
    {
      id: 'divider',
      icon: () => <div className="dock-divider" />,
      label: '',
      onClick: () => {}
    },
    {
      id: 'add',
      icon: Plus,
      label: 'Add Project',
      onClick: () => console.log('Add new project')
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      active: activeItem === 'settings',
      onClick: () => setActiveItem('settings')
    }
  ];

  const getItemScale = (itemId: string, index: number) => {
    if (!hoveredItem) return 1;

    const hoveredIndex = dockItems.findIndex(item => item.id === hoveredItem);
    const distance = Math.abs(index - hoveredIndex);

    if (distance === 0) return 1.6; // Hovered item
    if (distance === 1) return 1.3; // Adjacent items
    if (distance === 2) return 1.1; // Second adjacent items
    return 1; // Other items
  };

  const getItemY = (itemId: string, index: number) => {
    if (!hoveredItem) return 0;

    const hoveredIndex = dockItems.findIndex(item => item.id === hoveredItem);
    const distance = Math.abs(index - hoveredIndex);

    if (distance === 0) return -20; // Hovered item lifts up
    if (distance === 1) return -10; // Adjacent items lift slightly
    return 0;
  };

  return (
    <motion.div
      className="dock-container"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.5
      }}
    >
      <div className="dock">
        <div className="dock-background" />
        <div className="dock-items">
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            const isDivider = item.id === 'divider';

            if (isDivider) {
              return (
                <div key={item.id} className="dock-divider-container">
                  <div className="dock-divider" />
                </div>
              );
            }

            return (
              <motion.div
                key={item.id}
                className={`dock-item ${item.active ? 'dock-item-active' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={item.onClick}
                animate={{
                  scale: getItemScale(item.id, index),
                  y: getItemY(item.id, index)
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="dock-item-background" />
                <Icon
                  size={24}
                  className={`dock-item-icon ${item.active ? 'active' : ''}`}
                />

                {/* Active indicator */}
                {item.active && (
                  <motion.div
                    className="dock-item-indicator"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    className="dock-item-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 20
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.div>
                )}

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredItem === item.id && item.label && (
                    <motion.div
                      className="dock-tooltip"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 20
                      }}
                    >
                      {item.label}
                      <div className="dock-tooltip-arrow" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Dock;