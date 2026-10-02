import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Users, Flame, Calendar, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallengeDetails, setSelectedChallengeDetails] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [durationDays, setDurationDays] = useState(30);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post('/challenges', {
        title,
        description,
        category,
        duration_days: durationDays,
      });

      triggerConfetti();
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`);
      triggerConfetti();
      fetchChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewLeaderboard = async (challengeId) => {
    try {
      const res = await api.get(`/challenges/${challengeId}`);
      setSelectedChallengeDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (challengeId, newProgress) => {
    try {
      await api.put(`/challenges/${challengeId}/progress`, { progress_percentage: newProgress });
      fetchChallenges();
      if (selectedChallengeDetails) handleViewLeaderboard(challengeId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-purple-400 font-semibold animate-pulse">Loading Accountability Challenges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" /> Accountability Challenges
          </h1>
          <p className="text-xs text-slate-400 mt-1">Group challenges with friends & real-time participant leaderboards</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 hover:opacity-95 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create Challenge</span>
        </button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="glass-panel rounded-3xl p-6 border border-white/10 relative flex flex-col justify-between hover:border-purple-500/40 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {c.duration_days} Days
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-white mt-1.5">{c.title}</h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  🏆
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                {c.description || 'Group accountability challenge to keep everyone motivated.'}
              </p>

              {/* Creator & Participants avatars */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 mb-5">
                <div className="flex items-center space-x-2">
                  <img
                    src={c.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={c.creator?.name}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <span className="text-xs text-slate-400">Created by <strong className="text-white">{c.creator?.name}</strong></span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-indigo-400 font-bold">
                  <Users className="w-4 h-4" />
                  <span>{(c.participants || []).length} Members</span>
                </div>
              </div>

              {/* Progress if joined */}
              {c.is_joined && (
                <div className="mb-5">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Your Challenge Progress</span>
                    <span className="font-bold text-purple-400">{c.user_progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${c.user_progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-3 border-t border-white/5">
              {!c.is_joined ? (
                <button
                  onClick={() => handleJoinChallenge(c.id)}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:opacity-95 transition"
                >
                  Join Challenge 🚀
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateProgress(c.id, Math.min(100, c.user_progress + 15))}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
                >
                  + Log Daily Progress (+15%)
                </button>
              )}

              <button
                onClick={() => handleViewLeaderboard(c.id)}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Leaderboard 🏆
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Modal */}
      {selectedChallengeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedChallengeDetails(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">{selectedChallengeDetails.challenge?.title}</h3>
            <p className="text-xs text-slate-400 mb-6">Participant Ranking & Progress Leaderboard</p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(selectedChallengeDetails.leaderboard || []).map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-800/80 border-slate-400/30 text-slate-200'
                      : 'bg-slate-900/50 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img
                      src={p.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={p.user?.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">{p.user?.name}</div>
                      <div className="text-[10px] text-slate-400">Streak: {p.streak_count}d 🔥</div>
                    </div>
                  </div>

                  <span className="font-black text-sm text-purple-400">{p.progress_percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Create Group Challenge</h3>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Challenge Title</label>
                <input
                  type="text"
                  placeholder="e.g. 30-Day Coding Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  placeholder="Set the rules and target..."
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg"
                >
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
