import React, { useState, useEffect } from 'react';
import { Flame, Plus, Check, Calendar, Trophy, Sparkles, Trash2 } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('#ec4899');

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data.habits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post('/habits', {
        title,
        description,
        category,
        frequency,
        color,
      });

      triggerConfetti();
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHabit = async (habitId, dateStr = null) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`, { date: dateStr });
      if (res.data.logged) triggerConfetti();
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  // Generate last 14 days array for calendar grid
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-amber-400 font-semibold animate-pulse">Loading Habits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Flame className="w-8 h-8 text-amber-500 fill-amber-500" /> Habit Streaks
          </h1>
          <p className="text-xs text-slate-400 mt-1">Build daily consistency & lock in long-term discipline</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-amber-500/20 hover:opacity-95 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-panel rounded-3xl text-slate-400">
            <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No habits created yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-xs font-bold text-amber-400 hover:underline"
            >
              + Create your first habit streak
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const loggedDates = (habit.logs || []).map(l => l.completed_date);
            const isCompletedToday = loggedDates.includes(todayStr);

            return (
              <div key={habit.id} className="glass-panel rounded-3xl p-6 border border-white/10 relative group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: habit.color }}>
                      🔥
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{habit.title}</h3>
                      <p className="text-xs text-slate-400">{habit.description || 'Daily consistency habit'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Streak Stats */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 mb-5">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">Current Streak</span>
                      <span className="text-base font-black text-white">{habit.current_streak} Days</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Best Streak</span>
                    <span className="text-base font-bold text-amber-400">{habit.best_streak} Days 🏆</span>
                  </div>
                </div>

                {/* Today Check-in Button */}
                <button
                  onClick={() => handleToggleHabit(habit.id, todayStr)}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg ${
                    isCompletedToday
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-95'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  <span>{isCompletedToday ? 'Completed Today! 🔥' : 'Mark Completed Today'}</span>
                </button>

                {/* 14-Day Calendar Grid */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">Past 14 Days Completion History:</span>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto">
                    {last14Days.map((date) => {
                      const isLogged = loggedDates.includes(date);
                      const dayLetter = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' });
                      return (
                        <button
                          key={date}
                          onClick={() => handleToggleHabit(habit.id, date)}
                          title={`${date}: ${isLogged ? 'Completed' : 'Missed'}`}
                          className={`w-6 h-8 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition shrink-0 ${
                            isLogged
                              ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50'
                              : 'bg-slate-800/80 text-slate-500 hover:bg-slate-700'
                          }`}
                        >
                          <span>{dayLetter}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Habit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Create New Habit</h3>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Habit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Code 1 hour daily"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  placeholder="Details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
