import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AssignTaskModal } from './components/AssignTaskModal';

import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import { TasksPage } from './pages/TasksPage';
import { TotePadPage } from './pages/TotePadPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CreditsPage } from './pages/CreditsPage';
import { BuyingPage } from './pages/BuyingPage';
import { AssignedTasksPage } from './pages/AssignedTasksPage';
import { HabitsPage } from './pages/HabitsPage';
import { FriendsPage } from './pages/FriendsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
        <div className="animate-pulse text-indigo-400 font-bold">Loading Nokkuu Platform...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar onOpenAssignTaskModal={() => setIsAssignModalOpen(true)} />

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<DashboardPage onOpenAssignTaskModal={() => setIsAssignModalOpen(true)} />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/tasks" element={<TasksPage onOpenAssignTaskModal={() => setIsAssignModalOpen(true)} />} />
            <Route path="/tote-pad" element={<TotePadPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/buying" element={<BuyingPage />} />
            <Route path="/assigned-tasks" element={<AssignedTasksPage onOpenAssignTaskModal={() => setIsAssignModalOpen(true)} />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/friends" element={<FriendsPage onOpenAssignTaskModal={() => setIsAssignModalOpen(true)} />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}
