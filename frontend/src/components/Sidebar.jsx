import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CheckSquare, Send, Flame, Users, Trophy, Award, NotebookPen, Receipt, Wallet, ShoppingBag, Sparkles } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Tote Pad', path: '/tote-pad', icon: NotebookPen },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Cash Credits', path: '/credits', icon: Wallet },
    { name: 'Buying Planner', path: '/buying', icon: ShoppingBag },
    { name: 'Assigned Tasks', path: '/assigned-tasks', icon: Send },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-white/10 p-4 flex flex-row lg:flex-col justify-between shrink-0">
      <div className="w-full">
        {/* Navigation List */}
        <nav className="flex lg:flex-col space-x-1 lg:space-x-0 lg:space-y-1.5 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Social Differentiator Card */}
      <div className="hidden lg:block mt-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/30">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Accountability Engine</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Assign tasks to friends, track habit streaks & build accountability together.
        </p>
        <div className="text-[11px] font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 inline-block">
          Nokkuu Social Engine
        </div>
      </div>
    </aside>
  );
};
