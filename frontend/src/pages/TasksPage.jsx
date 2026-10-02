import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, Users, CheckCircle2, Circle, AlertCircle, Trash2, Send } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const TasksPage = ({ onOpenAssignTaskModal }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleCreatePersonalTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        due_date: dueDate || null,
        category,
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (newStatus === 'completed') triggerConfetti();
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      await api.post(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All'
      ? true
      : t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All'
      ? true
      : t.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All'
      ? true
      : (t.category || 'General').toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-400 font-semibold animate-pulse">Loading Tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-indigo-400" /> Tasks & Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">Personal to-dos & friend assigned accountability tasks</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAssignTaskModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs hover:bg-indigo-600/50 transition flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Assign to Friend</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Personal Task</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
            {['All', 'Pending', 'In_Progress', 'Completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Category:</span>
            {['All', 'Office', 'Personal', 'Purchase', 'Expenses', 'General'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No tasks match your criteria.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`glass-panel rounded-3xl p-5 border transition-all ${
                task.status === 'completed'
                  ? 'border-white/5 bg-slate-900/40 opacity-70'
                  : task.assigned_by
                  ? 'border-indigo-500/30 bg-indigo-950/20'
                  : 'border-white/10 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => handleUpdateStatus(task.id, task.status === 'completed' ? 'in_progress' : 'completed')}
                    className={`w-6 h-6 rounded-lg border mt-1 flex items-center justify-center transition shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          HIGH
                        </span>
                      )}
                      {task.assigned_by && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Assigned by: {task.assigned_by.name}
                        </span>
                      )}
                    </div>

                    {task.description && <p className="text-xs text-slate-300 mt-1">{task.description}</p>}

                    <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="font-semibold text-slate-400 capitalize">Status: {task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Friend Task Response Actions (Accept / Decline) */}
                <div className="flex items-center space-x-2 shrink-0">
                  {task.assigned_by && task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'accepted')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                      >
                        Accept Task
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'declined')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-700"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtasks Checklist */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 pl-9">
                  {task.subtasks.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleToggleSubtask(task.id, sub.id)}
                      className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white block"
                    >
                      {sub.is_completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span className={sub.is_completed ? 'line-through text-slate-500' : ''}>{sub.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Personal Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Create Personal Task</h3>

            <form onSubmit={handleCreatePersonalTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs bg-slate-900 text-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Personal">Personal</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Expenses">Expenses</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs bg-slate-900 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High 🔥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
