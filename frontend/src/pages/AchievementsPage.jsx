import React, { useState, useEffect } from 'react';
import { Award, Trophy, Target, Flame, Users, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import api from '../api/axios';

export const AchievementsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/achievements');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-amber-400 font-semibold animate-pulse">Loading Achievements & Badges...</div>
      </div>
    );
  }

  const { achievements = [], total_unlocked = 0, total_points = 0, level = 1, title = 'Growth Scout' } = data || {};

  const getBadgeIcon = (code) => {
    switch (code) {
      case 'first_goal': return <Target className="w-8 h-8 text-indigo-400" />;
      case 'streak_7': return <Flame className="w-8 h-8 text-amber-500 fill-amber-500" />;
      case 'tasks_100': return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case 'first_challenge': return <Trophy className="w-8 h-8 text-purple-400" />;
      case 'helped_friend': return <Users className="w-8 h-8 text-pink-400" />;
      default: return <Award className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="glass-panel-glow rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Trophy Room</span>
          </div>
          <h1 className="text-3xl font-black text-white">Achievements & Badges</h1>
          <p className="text-xs text-slate-300 mt-1">Unlock badges as you complete goals, maintain habit streaks & help friends</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-center">
            <div className="text-2xl font-black">{total_unlocked} / {achievements.length}</div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Unlocked Badges</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-center">
            <div className="text-2xl font-black">{total_points}</div>
            <div className="text-[10px] uppercase font-bold text-purple-400">Total Points</div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`glass-panel rounded-3xl p-6 border transition-all relative overflow-hidden ${
              ach.is_unlocked
                ? 'border-amber-500/40 bg-amber-500/5 shadow-xl shadow-amber-500/10'
                : 'border-white/10 opacity-60 bg-slate-900/40'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                ach.is_unlocked ? 'bg-amber-500/20 border-amber-500/40' : 'bg-slate-800 border-white/10'
              }`}>
                {ach.is_unlocked ? getBadgeIcon(ach.code) : <Lock className="w-7 h-7 text-slate-500" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-white">{ach.name}</h3>
                  {ach.is_unlocked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      UNLOCKED ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ach.description}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="text-purple-400">+{ach.points} XP</span>
                  {ach.is_unlocked && ach.unlocked_at && (
                    <span>Unlocked: {new Date(ach.unlocked_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
