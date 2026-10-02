import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Users, Target } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo(demoEmail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl glass-panel rounded-3xl border border-white/15 overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl relative z-10">
        
        {/* Left Side Branding */}
        <div className="p-8 lg:p-10 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900/90 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  NOKKUU
                </span>
                <span className="text-base font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                  നോക്കൂ
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white leading-tight mb-3">
              Build your goals. Build your habits. Help your friends grow.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              A personal growth and accountability platform where you can improve yourself and help your friends improve too.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span>Milestone-based goal tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <span>Habit streak calendars & celebrations</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Friend task assignment & accountability</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Accounts Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2.5">
              🚀 1-Click Instant Demo Login:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ameen@gmail.com')}
                className="py-2 px-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-white text-xs font-bold hover:bg-indigo-600/50 transition truncate"
              >
                Ameen
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('rahul@uply.io')}
                className="py-2 px-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-white text-xs font-bold hover:bg-purple-600/50 transition truncate"
              >
                Rahul
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@uply.io')}
                className="py-2 px-2.5 rounded-xl bg-pink-600/30 border border-pink-500/40 text-white text-xs font-bold hover:bg-pink-600/50 transition truncate"
              >
                Sarah
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Auth Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">{isRegister ? 'Create your Uply Account' : 'Welcome back'}</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your details to access your growth dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:opacity-95 disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
