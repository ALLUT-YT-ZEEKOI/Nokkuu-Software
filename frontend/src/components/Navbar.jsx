import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Bell, Trophy, LogOut, User as UserIcon, CheckCircle, Flame as FlameIcon, Sparkles, ChevronDown } from 'lucide-react';
import api from '../api/axios';

export const Navbar = ({ onOpenAssignTaskModal }) => {
  const { user, logout, loginAsDemo, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoSwitch = async (email) => {
    setShowDemoMenu(false);
    await loginAsDemo(email);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              NOKKUU
            </span>
            <span className="text-sm font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">
              നോക്കൂ
            </span>
          </div>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Accountability Platform
          </span>
        </div>
      </div>

      {/* User Actions & Stats */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Streak Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-bold shadow-sm">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
          <span>{user?.streak_count || 0}d Streak</span>
        </div>

        {/* Level / Title */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span>Lvl {user?.level || 1} • {user?.title || 'Growth Scout'}</span>
        </div>

        {/* Quick Assign Task Button */}
        {onOpenAssignTaskModal && (
          <button
            onClick={onOpenAssignTaskModal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
          >
            <span>+ Assign Task to Friend</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) markAllRead();
            }}
            className="relative p-2 rounded-xl bg-slate-800/80 border border-white/10 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-white/15 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" /> Notifications
                </h4>
                <button onClick={markAllRead} className="text-xs text-indigo-400 hover:underline">
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto mt-2 space-y-2.5">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-sm transition ${
                        n.is_read
                          ? 'bg-slate-900/40 border-white/5 text-slate-400'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-white mb-0.5">{n.title}</div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account & Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center space-x-2 p-1.5 pl-3 rounded-xl bg-slate-800/80 border border-white/10 hover:bg-slate-700 transition"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-300" />
            )}
            <span className="text-sm font-semibold text-white hidden md:inline">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Menu */}
          {showDemoMenu && (
            <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl p-3 shadow-2xl border border-white/15 z-50">
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <div className="font-bold text-sm text-white">{user?.name}</div>
                <div className="text-xs text-indigo-400 font-medium truncate">{user?.email}</div>
                <div className="text-[10px] text-slate-400 mt-1">Lvl {user?.level || 1} • {user?.title || 'Growth Scout'}</div>
              </div>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
