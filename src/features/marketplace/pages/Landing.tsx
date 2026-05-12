import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { UserRole } from '../../../types';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (currentUser?.role === UserRole.AGENT) {
      navigate('/agent/dashboard', { replace: true });
    } else if (currentUser?.role === UserRole.ADMIN) {
      navigate('/admin', { replace: true });
    } else {
      // Consumers and Guests go straight to the Marketplace
      navigate('/marketplace', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  return null; // Instant redirect, no UI
};

export default Landing;
