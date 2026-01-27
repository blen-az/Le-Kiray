import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import Navbar from './Navbar';
import Footer from './Footer';
import AIAssistant from '../../features/ai/components/AIAssistant';
import { logout } from '../../services/authService';

interface AppShellProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

const AppShell: React.FC<AppShellProps> = ({ currentUser, onUserChange }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onUserChange(null); // Clear the current user state
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Inter'] selection:bg-indigo-500/30">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout}
        onDashboard={() => navigate('/agent')}
      />
      <div className="flex-1">
        <Outlet context={{ onLogout: handleLogout }} />
      </div>
      <AIAssistant />
      <Footer />
    </div>
  );
};

export default AppShell;
