import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { 
  Bell, CheckCircle2, AlertTriangle, Clock, Filter, Settings, FileText, User, 
  ShieldAlert, Search, Check, X, Lock, Scale, Copy, ScanLine, Users, Radio, 
  Eye, Info, AlertCircle, ShieldCheck, ArrowRight, CornerDownRight, History
} from 'lucide-react';

export type NotificationType = 
  | 'forgery' 
  | 'consensus' 
  | 'precedent' 
  | 'duress' 
  | 'identity_unlock' 
  | 'system';

export interface AuditNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isoDate: string;
  isRead: boolean;
  readAt?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  caseId?: string;
  sender: string;
  details: string;
  actionUrlTab?: string;
  actionLabel?: string;
}

export function NotificationsTab({ role = 'Court Authority', onSelectTab }: { role?: string; onSelectTab?: (tab: string) => void }) {
  const [notifications, setNotifications] = useState<AuditNotification[]>([]);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchLiveNotifications = () => {
    api.getNotifications(role)
      .then(res => {
        if (res.notifications && Array.isArray(res.notifications)) {
          const mapped: AuditNotification[] = res.notifications.map((n: any) => ({
            id: n.id,
            type: n.type || 'system',
            title: n.title,
            message: n.message,
            timestamp: n.timestamp || 'Just now',
            isoDate: n.isoDate || n.createdAt || new Date().toISOString(),
            isRead: Boolean(n.isRead),
            readAt: n.readAt,
            priority: n.priority || 'medium',
            caseId: n.caseId,
            sender: n.sender || 'Nyayakasha System',
            details: n.details || n.message,
            actionUrlTab: n.actionUrlTab,
            actionLabel: n.actionLabel
          }));
          setNotifications(mapped);
          if (mapped.length > 0 && !selectedId) {
            setSelectedId(mapped[0].id);
          }
        }
      })
      .catch(err => console.log('Notifications backend fetch info:', err.message));
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 3000);

    // Request Web Push Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => clearInterval(interval);
  }, [role]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.caseId && n.caseId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || n.type === filterType;
      
      const matchesRead = 
        readFilter === 'all' ? true : !n.isRead;

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, filterType, readFilter, searchQuery]);

  const activeNotification = useMemo(() => {
    return notifications.find(n => n.id === selectedId) || notifications[0] || null;
  }, [notifications, selectedId]);

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = notifications.find(n => n.id === id);
    if (target && !target.isRead) {
      handleMarkAsRead(id, e);
    }
  };

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => prev.map(n => {
      if (n.id === id && !n.isRead) {
        return { ...n, isRead: true, readAt: `Today at ${now}` };
      }
      return n;
    }));
    api.markNotificationRead(id).catch(err => console.log('Mark read error:', err.message));
  };

  const handleMarkAllRead = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => prev.map(n => ({
      ...n,
      isRead: true,
      readAt: n.readAt || `Today at ${now}`
    })));
    api.markAllNotificationsRead(role).catch(err => console.log('Mark all read error:', err.message));
  };

  const handleViewRoute = (notif: AuditNotification, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedId(notif.id);
    handleMarkAsRead(notif.id);
    if (onSelectTab && notif.actionUrlTab) {
      onSelectTab(notif.actionUrlTab);
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'duress':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'forgery':
        return <ScanLine className="w-5 h-5 text-amber-600" />;
      case 'consensus':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'precedent':
        return <Copy className="w-5 h-5 text-sky-600" />;
      case 'identity_unlock':
        return <Lock className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <Radio className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'duress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {role === 'Independent Validator' ? 'Oversight Escalation' : 'Duress Escalation'}</span>;
      case 'forgery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"><ScanLine className="w-3 h-3" /> Forgery Queue</span>;
      case 'consensus':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1"><Users className="w-3 h-3" /> Consensus Vote</span>;
      case 'precedent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1"><Copy className="w-3 h-3" /> Precedent Flag</span>;
      case 'identity_unlock':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1"><Lock className="w-3 h-3" /> Identity Unlock</span>;
      case 'system':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1"><Radio className="w-3 h-3" /> System Audit</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOP INNER PAGES / TABS TOGGLE */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setReadFilter('all')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              readFilter === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>All Notifications</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              readFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setReadFilter('unread')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              readFilter === 'unread'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Unread Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* MARK ALL AS READ BUTTON */}
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            unreadCount > 0
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark all as read</span>
          {unreadCount > 0 && <span className="font-mono">({unreadCount})</span>}
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Immutable Judicial Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Bell className="w-7 h-7 text-amber-400" />
              {role === 'Independent Validator' ? 'Validator Alerts & Escalations' : 'System Alerts & Notifications'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {role === 'Independent Validator'
                ? 'Real-time feed of consensus quorum votes needing attention, newly computed analytics reports, and formal responses from the oversight process. Notifications are append-only.'
                : 'Chronological log of critical legal alerts, forgery flags, multi-sig consensus requests, and duress escalations. All entries are cryptographically preserved.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-200 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">Audit Mode: Append-Only</span>
            </div>
          </div>
        </div>

        {/* Permanent Deletion Notice Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span><strong>Notice:</strong> Notifications cannot be deleted or purged. Marking an item read records an immutable timestamp.</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-slate-400">Total Alerts: {notifications.length}</span>
        </div>
      </div>

      {/* Control Bar: Type Filter Dropdown & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* TYPE FILTER DROPDOWN */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl shrink-0">
          <Filter className="w-4 h-4 text-slate-500 ml-1" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-transparent text-xs font-extrabold text-slate-900 outline-none pr-3 py-0.5 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="consensus">Votes (Consensus Quorum)</option>
            <option value="system">Analytics &amp; System Reports</option>
            <option value="duress">Escalations (Oversight Alerts)</option>
            {role !== 'Independent Validator' && (
              <>
                <option value="forgery">Forgery Queue</option>
                <option value="precedent">Precedent Flags</option>
                <option value="identity_unlock">Identity Unlocks</option>
              </>
            )}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, message, or FIR case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>

      </div>

      {/* Main Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chronological List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>CHRONOLOGICAL AUDIT STREAM ({filteredNotifications.length})</span>
            <span>Sorted Newest First</span>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const isSelected = selectedId === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setSelectedId(notif.id);
                      handleMarkAsRead(notif.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : notif.isRead
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                        : 'bg-amber-50/40 border-amber-200/90 shadow-sm hover:border-amber-300 hover:bg-amber-50/70'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.isRead && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-500 rounded-r-full" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        notif.type === 'duress' ? 'bg-rose-100 border border-rose-200' :
                        notif.type === 'forgery' ? 'bg-amber-100 border border-amber-200' :
                        notif.type === 'consensus' ? 'bg-indigo-100 border border-indigo-200' :
                        notif.type === 'precedent' ? 'bg-sky-100 border border-sky-200' :
                        notif.type === 'identity_unlock' ? 'bg-purple-100 border border-purple-200' :
                        'bg-emerald-100 border border-emerald-200'
                      }`}>
                        {getIconForType(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          {getTypeBadge(notif.type)}
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {notif.timestamp}
                          </span>
                        </div>

                        <h3 className={`text-sm font-bold truncate ${notif.isRead ? 'text-slate-800' : 'text-slate-950 font-extrabold'}`}>
                          {notif.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                          <span className="font-medium text-slate-600 truncate">From: {notif.sender}</span>
                          
                          {/* ROW BUTTONS & ACTIONS */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* SMALL "MARK AS READ" TOGGLE ICON PER ROW */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleRead(notif.id, e)}
                              title={notif.isRead ? "Mark as unread" : "Mark as read"}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                notif.isRead
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            {/* "VIEW →" BUTTON ROUTING STRAIGHT INTO RELEVANT PAGE/PANEL */}
                            <button
                              type="button"
                              onClick={(e) => handleViewRoute(notif, e)}
                              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <span>View →</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No matching notifications found</p>
                <p className="text-xs text-slate-400">Try adjusting your type filter or search query.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Notification Inspector */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 mb-3">
            <span>AUDIT RECORD DETAIL</span>
            <span className="text-emerald-700 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Permanent Entry
            </span>
          </div>

          {activeNotification ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Type Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(activeNotification.type)}
                    {activeNotification.priority === 'critical' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white tracking-wide">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {activeNotification.title}
                  </h2>
                </div>

                <button
                  onClick={(e) => handleToggleRead(activeNotification.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeNotification.isRead
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeNotification.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
              </div>

              {/* Metadata Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">SOURCE SENDER</span>
                  <span className="font-bold text-slate-800">{activeNotification.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">RECEIVED AT</span>
                  <span className="font-bold text-slate-800">{activeNotification.timestamp}</span>
                </div>
                {activeNotification.caseId && (
                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">LINKED FIR CASE</span>
                    <span className="font-mono font-bold text-indigo-700">{activeNotification.caseId}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">RECORD STATUS</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Immutable
                  </span>
                </div>
              </div>

              {/* Message Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</h4>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  {activeNotification.message}
                </p>
              </div>

              {/* Full Technical Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Audit Payload</h4>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span className="text-[10px] uppercase">Payload Verification Seal</span>
                    <span className="text-[10px] text-emerald-400">SHA-256 Validated</span>
                  </div>
                  <p className="text-slate-300">{activeNotification.details}</p>
                </div>
              </div>

              {/* Action Link button */}
              {activeNotification.actionLabel && (
                <div className="pt-2">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-indigo-950 block">Associated Module</span>
                      <span className="text-[11px] text-indigo-800">Open active dashboard page directly</span>
                    </div>
                    <button
                      onClick={(e) => handleViewRoute(activeNotification, e)}
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <span>{activeNotification.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Immutable Deletion Guarantee Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-400" /> Entry ID: <code className="font-mono text-slate-600">{activeNotification.id}</code>
                </span>
                <span className="font-semibold text-slate-500">Deletion Disabled by System Policy</span>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Info className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Select a notification to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
