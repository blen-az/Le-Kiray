import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyInviteToken, completeAgentOnboarding } from '../../../services/onboardingService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

const AgentActivationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'verify' | 'setup' | 'success' | 'error'>('verify');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentId, setAgentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No invitation token provided');
        setStep('error');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        const invite = await verifyInviteToken(token);

        if (!invite) {
          setError('Invalid or expired invitation link. Please contact your admin for a new link.');
          setStep('error');
        } else {
          setAgentEmail(invite.email);
          setAgentId(invite.agentId);
          setStep('setup');
        }
      } catch (err: any) {
        console.error('Error verifying token:', err);
        setError('Failed to verify invitation. Please try again.');
        setStep('error');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Creating Firebase Auth account...');
      // Create Firebase Auth user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, agentEmail, password);
      const firebaseUID = userCredential.user.uid;
      console.log('Auth user created:', firebaseUID);

      // Now update the agent document with the Firebase UID and mark as activated
      console.log('Updating agent document with Firebase UID...');
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../../lib/firebase');
      
      await updateDoc(doc(db, 'users', agentId), {
        id: firebaseUID, // Update the document ID reference
        passwordHash: password,
        status: 'APPROVED',
        updatedAt: new Date().toISOString(),
      });

      // Complete onboarding in database
      console.log('Completing onboarding...');
      await completeAgentOnboarding(agentId, password, token!);

      console.log('Agent onboarding completed successfully');
      setStep('success');
    } catch (err: any) {
      console.error('Error during setup:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please contact support.');
      } else {
        setError(err.message || 'Failed to complete setup. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-white mb-3">Invitation Invalid</h1>
            <p className="text-slate-400 mb-6">{error || 'Something went wrong'}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl text-center">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-black text-white mb-3">Setup Complete!</h1>
            <p className="text-slate-400 mb-6">Your account is ready. You can now log in with your email and password.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Activate Your Account</h1>
          <p className="text-slate-400 font-medium">Set your password to get started</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-slate-800 shadow-2xl">
          <form onSubmit={handleSetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input
                type="email"
                value={agentEmail}
                disabled
                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <p className="mt-2 ml-1 text-[10px] text-slate-500 font-medium uppercase tracking-wide">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-900/40 transition-all hover:scale-[1.02]"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </div>
              ) : (
                'Activate Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-xs text-slate-500 font-medium uppercase tracking-wide">
          This link expires in 24 hours
        </p>
      </div>
    </div>
  );
};

export default AgentActivationPage;
