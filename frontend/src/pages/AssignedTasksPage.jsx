import React, { useState, useEffect } from 'react';
import { Send, Users, CheckCircle2, Clock, Plus, Filter, Sparkles, UserCheck, AlertCircle, ArrowUpRight, ArrowDownLeft, Globe } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const AssignedTasksPage = ({ onOpenAssignTaskModal }) => {
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'community'
  const [data, setData] = useState({ received_tasks: [], sent_tasks: [], community_assigned_tasks: [] });
  const [loading, setLoading] = useState(true);

  const fetchAssignedTasks = async () => {
    try {
      const res = await api.get('/assigned-tasks');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (newStatus === 'completed') triggerConfetti();
      fetchAssignedTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-400 font-semibold animate-pulse flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading Assigned Tasks Hub...</span>
        </div>
      </div>
    );
  }

  const { received_tasks = [], sent_tasks = [], community_assigned_tasks = [] } = data;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Send className="w-8 h-8 text-indigo-400" /> Friend Assigned Tasks Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track accountability tasks assigned between friends and across the community
          </p>
        </div>

        <button
          onClick={onOpenAssignTaskModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Assign Task to Friend</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Received Tasks</span>
            <ArrowDownLeft className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{received_tasks.length}</div>
          <span className="text-xs text-slate-400">Assigned to you by friends</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent Tasks</span>
            <ArrowUpRight className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{sent_tasks.length}</div>
          <span className="text-xs text-slate-400">Assigned by you to friends</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-pink-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community Feed</span>
            <Globe className="w-5 h-5 text-pink-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{community_assigned_tasks.length}</div>
          <span className="text-xs text-slate-400">All users assigned tasks</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
            activeTab === 'received'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Received ({received_tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
            activeTab === 'sent'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Assigned to Friends ({sent_tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
            activeTab === 'community'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Community Tasks Feed</span>
        </button>
      </div>

      {/* Tab Contents */}

      {/* TAB 1: RECEIVED TASKS */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {received_tasks.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-base">No tasks assigned to you yet.</p>
              <p className="text-xs text-slate-500 mt-1">When friends assign tasks to you, they will appear here!</p>
            </div>
          ) : (
            received_tasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel rounded-3xl p-5 border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <img
                    src={task.assigned_by?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={task.assigned_by?.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-indigo-500/40 shrink-0 mt-0.5"
                  />

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Assigned by: {task.assigned_by?.name}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          HIGH
                        </span>
                      )}
                    </div>

                    {task.description && <p className="text-xs text-slate-300 mt-1">{task.description}</p>}

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>Status: <strong className="text-indigo-300 capitalize">{task.status.replace('_', ' ')}</strong></span>
                      {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'accepted')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'declined')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {task.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg"
                    >
                      Mark Completed ✓
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      Completed ✓
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SENT TASKS (ASSIGNED TO FRIENDS) */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sent_tasks.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-base">You haven't assigned tasks to friends yet.</p>
              <button
                onClick={onOpenAssignTaskModal}
                className="mt-3 text-xs font-bold text-indigo-400 hover:underline"
              >
                + Assign your first task to a friend
              </button>
            </div>
          ) : (
            sent_tasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel rounded-3xl p-5 border border-purple-500/30 bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <img
                    src={task.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={task.user?.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-purple-500/40 shrink-0 mt-0.5"
                  />

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Assigned to: {task.user?.name}
                      </span>
                    </div>

                    {task.description && <p className="text-xs text-slate-300 mt-1">{task.description}</p>}

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>Friend Status: <strong className="text-purple-300 capitalize">{task.status.replace('_', ' ')}</strong></span>
                      {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : task.status === 'accepted'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {task.status === 'completed' ? 'Completed ✓' : task.status === 'accepted' ? 'Accepted & In Progress' : 'Pending Acceptance'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMMUNITY TASKS FEED (ALL USERS) */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-4 border border-white/10 bg-slate-900/40 mb-4">
            <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> Nokkuu Community Accountability Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live stream of tasks assigned between friends across the platform</p>
          </div>

          {community_assigned_tasks.map((task) => (
            <div
              key={task.id}
              className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2 shrink-0">
                  <img
                    src={task.assignedBy?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Assigner"
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                  />
                  <img
                    src={task.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt="Assignee"
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">{task.assignedBy?.name}</strong> assigned <strong className="text-indigo-400">"{task.title}"</strong> to <strong className="text-white">{task.user?.name}</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                task.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
