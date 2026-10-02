import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, CheckCircle2, Flame, Users, TrendingUp, Sparkles, Clock, AlertCircle, Plus, ChevronRight, Activity } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const DashboardPage = ({ onOpenAssignTaskModal }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleTaskStatusToggle = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (newStatus === 'completed') triggerConfetti();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHabitToggle = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`);
      if (res.data.logged) triggerConfetti();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-indigo-400 font-semibold animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span>Loading Uply Dashboard...</span>
        </div>
      </div>
    );
  }

  const { today_tasks = [], goals_summary = {}, habits_summary = {}, assigned_to_friends = [], assigned_by_friends = [], friend_activities = [], weekly_stats = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="glass-panel-glow rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/0 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Personal Growth Dashboard</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name}</span> 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              "Build your goals. Build your habits. Help your friends grow."
            </p>
          </div>

          <button
            onClick={onOpenAssignTaskModal}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:opacity-95 transition-all flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Assign Task to Friend</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Habit Streak */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit Streak</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{habits_summary.streak || 0}</span>
            <span className="text-xs text-amber-400 font-semibold">Days Active 🔥</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {habits_summary.completed_today || 0} of {habits_summary.total || 0} habits completed today
          </p>
        </div>

        {/* Goals Progress */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Goals</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{goals_summary.overall_progress || 0}%</span>
            <span className="text-xs text-indigo-400 font-semibold">Average Progress</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {goals_summary.completed || 0} of {goals_summary.total || 0} goals completed
          </p>
        </div>

        {/* Today's Tasks */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{today_tasks.filter(t => t.status === 'completed').length}</span>
            <span className="text-xs text-emerald-400 font-semibold">/ {today_tasks.length} Completed</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {today_tasks.filter(t => t.assigned_by_id).length} assigned by friends
          </p>
        </div>

        {/* Total Points / Level */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Growth Points</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{user?.total_points || 0}</span>
            <span className="text-xs text-purple-400 font-semibold">XP</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Level {user?.level || 1} • {user?.title || 'Growth Scout'}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Column (Tasks & Habits) | Right Column (Friend Activity & Social Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Tasks Module */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Today's Action Plan
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {today_tasks.filter(t => t.status === 'completed').length} of {today_tasks.length} Done
              </span>
            </div>

            {today_tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No tasks scheduled for today. Take rest or add a new goal!
              </div>
            ) : (
              <div className="space-y-3">
                {today_tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.status === 'completed'
                        ? 'bg-slate-900/40 border-white/5 opacity-60'
                        : task.assigned_by
                        ? 'bg-indigo-950/30 border-indigo-500/30'
                        : 'bg-slate-800/50 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleTaskStatusToggle(task.id, task.status === 'completed' ? 'in_progress' : 'completed')}
                        className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </h4>
                          {task.priority === 'high' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              HIGH
                            </span>
                          )}
                          {task.assigned_by && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Users className="w-3 h-3" /> From: {task.assigned_by.name}
                            </span>
                          )}
                        </div>
                        {task.description && <p className="text-xs text-slate-400 mt-1">{task.description}</p>}
                      </div>
                    </div>

                    {/* Friend Task Status Flow: Pending -> Accept -> Completed */}
                    {task.assigned_by && task.status === 'pending' && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleTaskStatusToggle(task.id, 'accepted')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleTaskStatusToggle(task.id, 'declined')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals Progress Summary */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" /> Active Goals Progress
              </h3>
            </div>

            <div className="space-y-4">
              {(goals_summary.goals || []).map((goal) => (
                <div key={goal.id} className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
                      <h4 className="font-bold text-sm text-white">{goal.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-semibold">
                        {goal.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">{goal.progress_percentage}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${goal.progress_percentage}%`,
                        backgroundColor: goal.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col) - Habits & Friend Social Activity Feed */}
        <div className="space-y-8">
          
          {/* Daily Habits Quick Tracker */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> Daily Habits
              </h3>
              <span className="text-xs font-bold text-amber-400">🔥 {habits_summary.streak}d Streak</span>
            </div>

            <div className="space-y-2.5">
              {(habits_summary.habits || []).map((habit) => {
                const isLoggedToday = habit.logs && habit.logs.length > 0;
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitToggle(habit.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isLoggedToday
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isLoggedToday ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{habit.title}</div>
                        <div className="text-[10px] text-slate-400">Streak: {habit.current_streak} days</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isLoggedToday ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'}`}>
                      {isLoggedToday ? 'Completed 🔥' : 'Tap to check-in'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Friend Activity Feed */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" /> Friend Activity
              </h3>
            </div>

            <div className="space-y-3">
              {friend_activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No friend activity yet. Add friends to see their growth updates!</p>
              ) : (
                friend_activities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-900/40 border border-white/5">
                    <img
                      src={act.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={act.user?.name}
                      className="w-7 h-7 rounded-lg object-cover mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white">{act.user?.name} </span>
                      <span className="text-slate-300">{act.content}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
