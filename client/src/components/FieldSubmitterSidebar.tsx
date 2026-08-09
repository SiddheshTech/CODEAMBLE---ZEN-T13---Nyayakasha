import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Lock,
  CheckCircle2,
  Check,
  BarChart3,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FolderOpen,
  Camera,
  Link2,
  Inbox,
  BadgeCheck,
  AlertTriangle,
  Scale,
  ShieldAlert,
  Database,
  Activity,
} from 'lucide-react';

interface FieldSubmitterSidebarProps {
  activeItem?: string;
  onSelect?: (item: string) => void;
  onLogout?: () => void;
  notificationCount?: number;
  role?: string;
  profileData?: any;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  badge?: number | string;
  badgeColor?: string;
}

export function FieldSubmitterSidebar({
  activeItem = 'Dashboard',
  onSelect = () => {},
  onLogout = () => {},
  notificationCount = 2,
  role = 'Court Authority',
  profileData = null,
}: FieldSubmitterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const independentValidatorNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, id: 'Dashboard' },
    {
      name: 'Validator Workspace',
      icon: ShieldAlert,
      id: 'Validator Workspace',
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      name: 'Consensus Requests',
      icon: Database,
      id: 'Consensus Requests',
      badge: 2,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Duress Alerts',
      icon: AlertTriangle,
      id: 'Duress Alerts',
      badge: '!',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    { name: 'Aggregate analytics', icon: BarChart3, id: 'Aggregate analytics' },
    { name: 'Audit log', icon: FileText, id: 'Audit log' },
  ];

  const courtAuthorityNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, id: 'Dashboard' },
    { name: 'Case Files', icon: FolderOpen, id: 'Case Files' },
    {
      name: 'Forgery review',
      icon: AlertTriangle,
      id: 'Forgery review',
      badge: 3,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      name: 'Identity unlock',
      icon: Lock,
      id: 'Identity unlock',
      badge: 'Judge',
      badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
    },
    {
      name: 'Consensus votes',
      icon: CheckCircle2,
      id: 'Consensus votes',
      badge: 2,
      badgeColor: 'bg-[#FEEFC3] text-[#7C4A00]',
    },
    {
      name: 'Precedent flags',
      icon: Scale,
      id: 'Precedent flags',
      badge: 3,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200',
    },
    { name: 'Aggregate analytics', icon: BarChart3, id: 'Aggregate analytics' },
    { name: 'Audit log', icon: FileText, id: 'Audit log' },
  ];

  const fieldSubmitterNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, id: 'Dashboard' },
    { name: 'Capture evidence', icon: Camera, id: 'Capture evidence' },
    { name: 'Submit testimony', icon: FileText, id: 'Submit testimony' },
    { name: 'Chain of Custody', icon: Link2, id: 'Chain of Custody' },
    { name: 'My submissions', icon: Inbox, id: 'My submissions' },
    { name: 'Aggregate analytics', icon: BarChart3, id: 'Aggregate analytics' },
    { name: 'Audit log', icon: FileText, id: 'Audit log' },
  ];

  const mainNavItems =
    role === 'Independent Validator'
      ? independentValidatorNavItems
      : role === 'Court Authority'
      ? courtAuthorityNavItems
      : fieldSubmitterNavItems;

  const accountNavItems: NavItem[] = [
    {
      name: 'Notifications',
      icon: Bell,
      id: 'Notifications',
      badge: notificationCount,
    },
    { name: 'Profile', icon: User, id: 'Profile' },
    { name: 'Settings', icon: Settings, id: 'Settings' },
  ];

  const handleNavItemClick = (itemId: string) => {
    onSelect(itemId);
    setIsMobileOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const userInitials = profileData ? getInitials(profileData.fullName) : (role === 'Field Submitter' ? 'RK' : 'AM');
  const userName = profileData ? profileData.fullName : (role === 'Field Submitter' ? 'Officer R. Kulkarni' : 'Adv. A. Mehta');
  const userSubtitle = role;

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full p-4 select-none font-sans bg-white">
      {/* Brand & Header Section */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          {/* Light Blue Brand Card */}
          <div
            className={`flex items-center gap-3 overflow-hidden p-2.5 rounded-2xl bg-[#D8E6FF]/70 border border-[#D3E3FD] ${
              collapsed ? 'justify-center p-2' : 'w-full'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#D3E3FD] text-[#0B57D0] flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5 text-[#0B57D0]" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-base font-extrabold tracking-tight text-[#041E49] leading-tight truncate">
                  NYAYAKASHA
                </span>
                <span className="text-xs font-semibold text-[#041E49]/70 truncate">
                  {role}
                </span>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 text-black/60 hover:text-black items-center justify-center transition-colors shrink-0 ml-2"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="hidden md:flex justify-center mt-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 text-black/60 hover:text-black flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigations Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-6">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 tracking-tight">
              Main
            </p>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeItem === item.id ||
                (item.id === 'Aggregate analytics' &&
                  (activeItem === 'Analytics' ||
                    activeItem === 'Aggregate analytics' ||
                    activeItem === 'Aggregate Analytics')) ||
                (item.id === 'Audit log' &&
                  (activeItem === 'Audit Logs' || activeItem === 'Audit log'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  title={collapsed ? item.name : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#D3E3FD] text-[#041E49] font-bold rounded-2xl'
                      : 'text-[#1F1F1F] font-medium hover:text-black hover:bg-black/5 rounded-2xl'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'text-[#0B57D0]'
                        : 'text-black/60 group-hover:text-black group-hover:scale-105'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {!collapsed && item.badge !== undefined && item.badge !== null ? (
                    <span
                      className={`ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        item.badgeColor || 'bg-[#FEEFC3] text-[#7C4A00]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}

                  {collapsed && item.badge ? (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 tracking-tight">
              Account
            </p>
          )}
          <nav className="space-y-1">
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  title={collapsed ? item.name : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#D3E3FD] text-[#041E49] font-bold rounded-2xl'
                      : 'text-[#1F1F1F] font-medium hover:text-black hover:bg-black/5 rounded-2xl'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="relative shrink-0">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive
                          ? 'text-[#0B57D0]'
                          : 'text-black/60 group-hover:text-black group-hover:scale-105'
                      }`}
                    />
                    {collapsed && item.badge ? (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
                    ) : null}
                  </div>

                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {!collapsed && item.badge ? (
                    <span
                      className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive
                          ? 'bg-[#0B57D0] text-white'
                          : 'bg-black/5 text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Footer Section */}
      <div className="pt-4 border-t border-black/5 mb-1 shrink-0">
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } p-2 bg-white rounded-2xl hover:bg-slate-50 transition-all`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Avatar Circle */}
            {(() => {
              const uObj = (() => { try { return JSON.parse(localStorage.getItem('nyayakasha_user') || '{}'); } catch { return {}; } })();
              const photo = profileData?.profilePhotoUrl || uObj.profilePhotoUrl;
              return (
                <div className="w-9 h-9 rounded-full bg-[#E1E3E1] text-[#1F1F1F] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              );
            })()}

            {!collapsed && (
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-sm font-bold text-[#1F1F1F] truncate leading-tight">
                  {userName}
                </span>
                <span className="text-xs text-black/50 font-medium truncate mt-0.5">
                  {userSubtitle}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-black/40 hover:text-black hover:bg-black/5 transition-colors shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header with Hamburger toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-black/5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D3E3FD] text-[#0B57D0] flex items-center justify-center font-bold">
            <Lock className="w-4 h-4 text-[#0B57D0]" />
          </div>
          <div>
            <span className="text-base font-bold text-black leading-tight block">
              NYAYAKASHA
            </span>
            <span className="text-[10px] font-semibold text-black/50 uppercase tracking-wider block -mt-0.5">
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-black transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 border-r border-black/10 shadow-2xl flex flex-col"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-black/5 h-screen sticky top-0 transition-all duration-300 z-20 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>
    </>
  );
}

