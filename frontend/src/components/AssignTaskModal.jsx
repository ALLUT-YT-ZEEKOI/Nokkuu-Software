import React, { useState, useEffect } from 'react';
import { X, Send, UserCheck, Calendar, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export const AssignTaskModal = ({ isOpen, onClose, onTaskAssigned }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      const friendsList = res.data.friends || [];
      setFriends(friendsList);
      if (friendsList.length > 0) {
        setSelectedFriendId(friendsList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedFriendId) {
      setError('Please provide a task title and select a friend.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/tasks', {
        title,
        description,
        priority,
        due_date: dueDate || null,
        assigned_to_user_id: selectedFriendId,
      });

      if (onTaskAssigned) onTaskAssigned(res.data.task);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Assign Task to Friend</h3>
            <p className="text-xs text-slate-400">Help your friends grow through accountability task assignment</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Friend</label>
            {friends.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                You have no accepted friends yet. Add friends from the Friends page first!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {friends.map(friend => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                      selectedFriendId == friend.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={friend.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="truncate">{friend.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Complete React Dashboard by Friday"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Optional)</label>
            <textarea
              placeholder="Provide context or instructions for your friend..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || friends.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
