import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Clock,
  Globe,
  Shield,
  Smartphone,
  CheckCircle2,
  Lock,
  LogOut,
  Laptop,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  History,
  Trash2,
  Info,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

interface NotificationToggleState {
  consensus: { email: boolean; push: boolean };
  analytics: { email: boolean; push: boolean };
  escalation: { email: boolean; push: boolean };
}

interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginRecord {
  id: string;
  timestamp: string;
  location: string;
  device: string;
  ip: string;
  status: 'Success' | 'Failed';
}

export function SettingsTab({ role }: { role: string }) {
  const isValidator = role === 'Independent Validator';

  // Expandable sections state (all open by default)
  const [expandedSections, setExpandedSections] = useState({
    notifications: true,
    security: true,
    display: true,
  });

  const toggleSection = (section: 'notifications' | 'security' | 'display') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. NOTIFICATION TOGGLES (Consensus votes / Analytics reports / Escalation responses)
  const [notifications, setNotifications] = useState<NotificationToggleState>({
    consensus: { email: true, push: true },
    analytics: { email: true, push: false },
    escalation: { email: true, push: true },
  });

  const toggleNotif = (category: keyof NotificationToggleState, channel: 'email' | 'push') => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
  };

  // 2. SESSION TIMEOUT & SECURITY
  const [sessionTimeout, setSessionTimeout] = useState<number>(15);

  // Active Sessions Modal State
  const [showActiveSessionsModal, setShowActiveSessionsModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  // Login History Modal State
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);

  // 3. LANGUAGE & DISPLAY
  const [language, setLanguage] = useState<string>('en-IN');
  const [themeMode, setThemeMode] = useState<string>('system');

  // Bottom Save State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real settings, active sessions, and login history from backend database
  React.useEffect(() => {
    setIsLoadingSettings(true);
    api.getSettings()
      .then(data => {
        if (data.success) {
          if (data.settings) {
            if (data.settings.notifications) setNotifications(data.settings.notifications);
            if (data.settings.sessionTimeout) setSessionTimeout(data.settings.sessionTimeout);
            if (data.settings.language) setLanguage(data.settings.language);
            if (data.settings.themeMode) setThemeMode(data.settings.themeMode);
          }
          if (data.activeSessions) setActiveSessions(data.activeSessions);
          if (data.loginHistory) setLoginHistory(data.loginHistory);
        }
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setIsLoadingSettings(false));
  }, []);

  const handleRevokeSession = async (id: string) => {
    try {
      await api.revokeSession(id);
      setActiveSessions(prev => prev.filter(s => s.id !== id));
      showToast('Session terminated and cryptographic token revoked.');
    } catch (e: any) {
      showToast('Failed to revoke session: ' + (e.message || 'Error'));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateSettings({
        notifications,
        sessionTimeout,
        language,
        themeMode
      });
      if (res.success) {
        showToast('System settings and security preferences saved successfully.');
      } else {
        showToast(res.message || 'Failed to save settings');
      }
    } catch (err: any) {
      showToast('Error saving settings: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto font-sans relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-indigo-300">
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Institutional Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Settings &amp; Security Controls
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Manage category alert channels, view active session devices, inspect login audit histories, and set language display preferences.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-200 font-mono flex items-center gap-2 shrink-0">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Role: {role}</span>
          </div>
        </div>
      </div>

      {/* ONE PAGE ORGANIZED INTO THREE EXPANDABLE SECTIONS */}
      <div className="space-y-6">

        {/* 1. NOTIFICATIONS SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full p-6 sm:p-7 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Notifications Section</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Configure separate email and push toggles per notification category
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              {expandedSections.notifications ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.notifications && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-6 sm:p-7 space-y-4">
                  {[
                    {
                      id: 'consensus',
                      title: 'Consensus votes',
                      description: 'Requests for your judicial multi-signature or validator vote on evidence quorums.',
                      badge: 'Quorum Vote',
                    },
                    {
                      id: 'analytics',
                      title: 'Analytics reports',
                      description: 'Homomorphic analysis, drift statistics, and evidence velocity summaries ready for review.',
                      badge: 'Analytics',
                    },
                    {
                      id: 'escalation',
                      title: 'Escalation responses',
                      description: 'Formal responses and ticket updates from the Judicial Oversight Board.',
                      badge: 'Escalations',
                    },
                  ].map((cat) => {
                    const key = cat.id as keyof NotificationToggleState;
                    return (
                      <div
                        key={cat.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">{cat.title}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 text-slate-800">
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{cat.description}</p>
                        </div>

                        {/* Separate Email & Push Toggles */}
                        <div className="flex items-center gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          {/* Email Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800 select-none">
                            <input
                              type="checkbox"
                              checked={notifications[key].email}
                              onChange={() => toggleNotif(key, 'email')}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span>Email Toggle</span>
                          </label>

                          {/* Push Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800 select-none">
                            <input
                              type="checkbox"
                              checked={notifications[key].push}
                              onChange={() => toggleNotif(key, 'push')}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span>Push Toggle</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. SESSION & SECURITY SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('security')}
            className="w-full p-6 sm:p-7 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Session &amp; Security Section</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enforced idle timeouts, active device session management, and past login audit trail
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              {expandedSections.security ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.security && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-6 sm:p-7 space-y-6">
                  
                  {/* SESSION TIMEOUT (FIXED VALUE WITH FLOOR NOTE) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">Session Timeout</span>
                        <span className="text-xs text-slate-500 font-medium">
                          Idle period before automatic session lock
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(Number(e.target.value))}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                        >
                          <option value={15}>15 Minutes</option>
                          <option value={30}>30 Minutes</option>
                          <option value={60}>60 Minutes</option>
                          <option value={120}>120 Minutes</option>
                        </select>
                      </div>
                    </div>

                    {/* Prominent Floor Enforced Note */}
                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <Info className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Note: Minimum enforced: 15 minutes</span>
                    </div>
                  </div>

                  {/* ACTIVE SESSIONS & LOGIN HISTORY ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* View Active Sessions Button */}
                    <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-indigo-600" /> Active Logged-In Sessions
                        </h4>
                        <p className="text-xs text-indigo-800/80 mt-0.5">
                          Currently authorized hardware tokens and web sessions ({activeSessions.length})
                        </p>
                      </div>
                      <button
                        onClick={() => setShowActiveSessionsModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>View active sessions</span>
                      </button>
                    </div>

                    {/* View Login History Button */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-600" /> Authentication Audit Log
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Inspect recent login attempts, IP addresses, and MFA success status
                        </p>
                      </div>
                      <button
                        onClick={() => setShowLoginHistoryModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                        <span>View login history</span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. LANGUAGE & DISPLAY SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('display')}
            className="w-full p-6 sm:p-7 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Language &amp; Display Section</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Regional language selection and interface display configuration
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              {expandedSections.display ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.display && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-6 sm:p-7 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Language Dropdown Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-800 block">
                        Language Dropdown Selector
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                      >
                        <option value="en-IN">English (India - Judicial Standard)</option>
                        <option value="hi-IN">Hindi (हिन्दी - High Court Edition)</option>
                        <option value="mr-IN">Marathi (मराठी - High Court Regional)</option>
                        <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                        <option value="ta-IN">Tamil (தமிழ்)</option>
                        <option value="bn-IN">Bengali (বাংলা)</option>
                      </select>
                    </div>

                    {/* Display Theme Mode */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-800 block">
                        Interface Density &amp; Theme
                      </label>
                      <select
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                      >
                        <option value="system">High-Contrast Light (Judicial Standard)</option>
                        <option value="compact">Compact Dense Table Layout</option>
                        <option value="large">Large Accessibility Contrast</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* SAVE CHANGES BUTTON AT THE BOTTOM OF THE WHOLE SETTINGS PAGE */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-medium">
          Settings are automatically applied across all connected devices upon saving.
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          {isSaving ? (
            <span>Saving changes...</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save changes</span>
            </>
          )}
        </button>
      </div>

      {/* MODAL 1: VIEW ACTIVE SESSIONS */}
      <AnimatePresence>
        {showActiveSessionsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" /> Active Logged-In Sessions
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Devices currently authenticated with active session tokens
                  </p>
                </div>
                <button
                  onClick={() => setShowActiveSessionsModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions.length > 0 ? (
                  activeSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sess.isCurrent ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          sess.isCurrent ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {sess.deviceType === 'desktop' ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">{sess.deviceName}</span>
                            {sess.isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            IP: <code className="font-mono font-bold text-slate-700">{sess.ipAddress}</code> • Location: {sess.location}
                          </p>
                          <p className="text-[10px] text-slate-400">Last active: {sess.lastActive}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {sess.isCurrent ? (
                          <span className="text-[11px] text-emerald-700 font-extrabold px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                            Active Session
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">No active remote sessions found.</div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowActiveSessionsModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VIEW LOGIN HISTORY */}
      <AnimatePresence>
        {showLoginHistoryModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" /> Judicial Login History
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Historical record of past login attempts and authentication outcomes
                  </p>
                </div>
                <button
                  onClick={() => setShowLoginHistoryModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {loginHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{rec.device}</span>
                        <span className="font-mono text-slate-400 text-[11px]">({rec.ip})</span>
                      </div>
                      <p className="text-slate-500">Date: <strong>{rec.timestamp}</strong> • Location: {rec.location}</p>
                    </div>

                    <div className="shrink-0">
                      <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] ${
                        rec.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {rec.status === 'Success' ? '✓ Success' : '✕ Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowLoginHistoryModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

