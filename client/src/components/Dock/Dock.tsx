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
      icon: () => <div className="w-px h-8 bg-black/10 rounded-full" />,
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

    switch (distance) {
      case 0: return 1.4; // Hovered item
      case 1: return 1.2; // Adjacent items
      case 2: return 1.05; // Second adjacent items
      default: return 1; // Other items
    }
  };

  const getItemY = (itemId: string, index: number) => {
    if (!hoveredItem) return 0;

    const hoveredIndex = dockItems.findIndex(item => item.id === hoveredItem);
    const distance = Math.abs(index - hoveredIndex);

    switch (distance) {
      case 0: return -16; // Hovered item lifts up
      case 1: return -8; // Adjacent items lift slightly
      default: return 0;
    }
  };

  return (
    <motion.div
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.5
      }}
    >
      <div className="flex items-end gap-1 px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          const isDivider = item.id === 'divider';

          if (isDivider) {
            return (
              <div key={item.id} className="flex items-center mx-2">
                <Icon />
              </div>
            );
          }

          return (
            <motion.div
              key={item.id}
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer
                transition-colors duration-200 origin-bottom
                ${item.active
                  ? 'bg-white/40 border border-white/60'
                  : 'hover:bg-white/20'
                }
              `}
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
              <Icon
                size={24}
                className={`
                  transition-all duration-200
                  ${item.active
                    ? 'text-system-blue drop-shadow-sm'
                    : 'text-black/70 hover:text-black/90'
                  }
                `}
              />

              {/* Active indicator */}
              {item.active && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-system-blue rounded-full shadow-lg"
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
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 bg-system-red text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white"
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
                    className="absolute bottom-full mb-3 px-3 py-1.5 bg-black/80 text-white text-sm font-medium rounded-lg backdrop-blur-sm whitespace-nowrap"
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
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Dock;