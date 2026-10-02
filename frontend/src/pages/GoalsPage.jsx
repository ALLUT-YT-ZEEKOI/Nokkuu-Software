import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle, Calendar, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [milestones, setMilestones] = useState([{ title: '' }]);
  const [newMilestoneInput, setNewMilestoneInput] = useState({});

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const validMilestones = milestones.filter(m => m.title.trim() !== '');
      await api.post('/goals', {
        title,
        description,
        category,
        target_date: targetDate || null,
        color,
        milestones: validMilestones,
      });

      triggerConfetti();
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setMilestones([{ title: '' }]);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await api.post(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
      if (res.data.goal.progress_percentage >= 100) triggerConfetti();
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (goalId) => {
    const text = newMilestoneInput[goalId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/goals/${goalId}/milestones`, { title: text });
      setNewMilestoneInput(prev => ({ ...prev, [goalId]: '' }));
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGoals = selectedCategory === 'All'
    ? goals
    : goals.filter(g => g.category.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-indigo-400 font-semibold animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span>Loading Goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-indigo-400" /> Growth Goals
          </h1>
          <p className="text-xs text-slate-400 mt-1">Define long-term vision & track milestone step completion</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['All', 'Coding', 'Health', 'Career', 'Mindset'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-panel rounded-3xl text-slate-400">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No goals found in this category.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-xs font-bold text-indigo-400 hover:underline"
            >
              + Add your first goal
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="glass-panel rounded-3xl p-6 border border-white/10 relative group">
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md" style={{ backgroundColor: goal.color }}>
                    🎯
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{goal.title}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {goal.category}
                      </span>
                      {goal.target_date && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {goal.description && (
                <p className="text-xs text-slate-300 mb-4">{goal.description}</p>
              )}

              {/* Progress Meter */}
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Goal Progress</span>
                  <span className="font-bold text-indigo-400">{goal.progress_percentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress_percentage}%`, backgroundColor: goal.color }}
                  />
                </div>
              </div>

              {/* Milestones Breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Milestones ({goal.milestones?.filter(m => m.is_completed).length || 0}/{(goal.milestones || []).length})
                </h4>

                {(goal.milestones || []).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleToggleMilestone(goal.id, m.id)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center space-x-2.5 ${
                      m.is_completed
                        ? 'bg-slate-900/60 border-white/5 text-slate-400 line-through'
                        : 'bg-slate-800/40 border-white/10 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {m.is_completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{m.title}</span>
                  </button>
                ))}

                {/* Add Milestone Inline */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add milestone step..."
                    value={newMilestoneInput[goal.id] || ''}
                    onChange={(e) => setNewMilestoneInput({ ...newMilestoneInput, [goal.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    onClick={() => handleAddMilestone(goal.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Create New Growth Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Learn Laravel in 30 days"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  placeholder="Describe your vision and why this goal matters..."
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
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Mindset">Mindset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Milestone Steps</label>
                <div className="space-y-2">
                  {milestones.map((m, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Milestone #${index + 1}`}
                        value={m.title}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[index].title = e.target.value;
                          setMilestones(updated);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMilestones([...milestones, { title: '' }])}
                    className="text-xs font-bold text-indigo-400 hover:underline pt-1"
                  >
                    + Add another milestone step
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
