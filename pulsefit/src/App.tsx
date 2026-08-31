import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';

// User Pages
import { HomeDashboard } from './pages/user/HomeDashboard';
import { WorkoutsPage } from './pages/user/WorkoutsPage';
import { ExerciseLibraryPage } from './pages/user/ExerciseLibraryPage';
import { NutritionPage } from './pages/user/NutritionPage';
import { ProgressPage } from './pages/user/ProgressPage';
import { WorkoutHistoryPage } from './pages/user/WorkoutHistoryPage';
import { FavoritesPage } from './pages/user/FavoritesPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Page
import { AdminLayout } from './pages/admin/AdminLayout';

// Modals
import { ActiveWorkoutModal } from './components/user/ActiveWorkoutModal';
import { WorkoutDetailModal } from './components/user/WorkoutDetailModal';
import { ExerciseDetailModal } from './components/user/ExerciseDetailModal';
import { MealDetailModal } from './components/user/MealDetailModal';
import { FitnessCalculatorsModal } from './components/user/FitnessCalculatorsModal';
import { NotificationCenterModal } from './components/user/NotificationCenterModal';
import { WorkoutCompletedModal } from './components/user/WorkoutCompletedModal';
import { AuthModal } from './components/user/AuthModal';

type UserTab = 'home' | 'workouts' | 'exercises' | 'nutrition' | 'progress' | 'history' | 'favorites' | 'profile';

const MainAppContent: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { activeWorkoutState } = useFitness();

  const [activeTab, setActiveTab] = useState<UserTab>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // If in Admin Mode, render the full admin management portal
  if (isAdminMode && isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D9FF00] selection:text-black">
        <AdminLayout onSwitchToUser={() => setIsAdminMode(false)} />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D9FF00] selection:text-black flex flex-col pb-20 lg:pb-10">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onSwitchToAdmin={() => setIsAdminMode(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {activeTab === 'home' && <HomeDashboard onNavigateTab={setActiveTab} />}
        {activeTab === 'workouts' && <WorkoutsPage />}
        {activeTab === 'exercises' && <ExerciseLibraryPage />}
        {activeTab === 'nutrition' && <NutritionPage />}
        {activeTab === 'progress' && <ProgressPage />}
        {activeTab === 'history' && <WorkoutHistoryPage />}
        {activeTab === 'favorites' && <FavoritesPage />}
        {activeTab === 'profile' && (
          <ProfilePage
            onNavigateTab={setActiveTab}
            onSwitchToAdmin={() => setIsAdminMode(true)}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile / Quick Access */}
      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Modals & Overlays */}
      <ActiveWorkoutModal />
      <WorkoutDetailModal />
      <ExerciseDetailModal />
      <MealDetailModal />
      <FitnessCalculatorsModal />
      <NotificationCenterModal />
      <WorkoutCompletedModal />
      <AuthModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FitnessProvider>
        <MainAppContent />
      </FitnessProvider>
    </AuthProvider>
  );
}
