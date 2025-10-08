import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users as UsersIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChevronDown,
  ArrowLeft,
  User
} from 'lucide-react';
import { apiService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Listen for localStorage changes to update user info
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from within the same tab
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: t('sidebar.dashboard')
    },
    {
      path: '/projects',
      icon: FolderKanban,
      label: t('sidebar.projects')
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: t('sidebar.tasks')
    },
    {
      path: '/team',
      icon: UsersIcon,
      label: t('sidebar.team')
    }
  ];

  const adminMenuItems = [
    {
      path: '/admin/users',
      icon: UsersIcon,
      label: t('sidebar.users')
    },
    {
      path: '/admin/roles',
      icon: Shield,
      label: t('sidebar.rolesAndPermissions')
    }
  ];

  const isAdmin = ['Administrator', 'admin'].includes(user.role);

  const handleAdminToggle = () => {
    setIsAdminMode(!isAdminMode);
    if (!isAdminMode) {
      navigate('/admin/users');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-slate-900">PrismFlow</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdminMode ? (
          <>
            {/* Admin Mode Header */}
            <button
              onClick={handleAdminToggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{t('sidebar.normalMode')}</span>}
            </button>

            {!isCollapsed && (
              <div className="px-3 pb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('sidebar.administration')}
                </p>
              </div>
            )}

            {adminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </>
        ) : (
          <>
            {/* Normal Mode */}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200 relative">
        {/* Admin Mode Toggle Button */}
        {isAdmin && !isAdminMode && (
          <button
            onClick={handleAdminToggle}
            className={`w-full mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{t('sidebar.administration')}</span>}
          </button>
        )}

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {user.profilePicture ? (
              <img
                src={`${API_BASE_URL}/${user.profilePicture}`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden ${
                  isCollapsed ? 'left-auto right-auto w-48' : ''
                }`}
              >
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <Languages className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {i18n.language === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-200"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{t('sidebar.settings')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-slate-200"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">{t('auth.logout')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
