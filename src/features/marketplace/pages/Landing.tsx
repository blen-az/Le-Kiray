import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { UserRole } from '../../../types';
import ConsumerHome from '../components/ConsumerHome';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (currentUser?.role === UserRole.AGENT) {
      navigate('/agent/dashboard', { replace: true });
    } else if (currentUser?.role === UserRole.ADMIN) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // AGENT and ADMIN will be redirected via the useEffect
  if (currentUser?.role === UserRole.AGENT || currentUser?.role === UserRole.ADMIN) {
    return null;
  }

  return <ConsumerHome />;
};

export default Landing;
