import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyInviteToken, completeAgentOnboarding } from '../../../services/onboardingService';
import { getSubscriptionPlans, createSubscription } from '../../../services/subscriptionService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { SubscriptionPlan } from '../../../types';

const AgentActivationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'verify' | 'password' | 'business' | 'plan' | 'success' | 'error'>('verify');
  
  // Data
  const [agentEmail, setAgentEmail] = useState('');
  const [agentId, setAgentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [serviceLocations, setServiceLocations] = useState('');
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setError('No invitation token provided');
        setStep('error');
        setLoading(false);
        return;
      }

      try {
        const [invite, fetchedPlans] = await Promise.all([
          verifyInviteToken(token),
          getSubscriptionPlans()
        ]);

        if (!invite) {
          setError('Invalid or expired invitation link. Please contact your admin for a new link.');
          setStep('error');
        } else {
          setAgentEmail(invite.email);
          setAgentId(invite.agentId);
          // Fetch the old doc to pre-fill companyName if possible
          const oldDocRef = doc(db, 'users', invite.agentId);
          const oldDocSnap = await getDoc(oldDocRef);
          if (oldDocSnap.exists()) {
            setCompanyName(oldDocSnap.data().companyName || '');
            setContactPhone(oldDocSnap.data().contactPhone || '');
          }
          
          setPlans(fetchedPlans.filter(p => p.category !== 'CONSUMER'));
          setStep('password');
        }
      } catch (err: any) {
        setError('Failed to load. Please try again.');
        setStep('error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const handleNextToBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setError(null);
    setStep('business');
  };

  const handleNextToPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPhone.trim() || !serviceLocations.trim()) {
      setError('Please fill out all business details');
      return;
    }
    setError(null);
    setStep('plan');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Please select a subscription plan');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, agentEmail, password);
      const firebaseUID = userCredential.user.uid;

      // 2. Migrate the agent document
      const oldDocRef = doc(db, 'users', agentId);
      const oldDocSnap = await getDoc(oldDocRef);
      
      if (!oldDocSnap.exists()) {
        throw new Error("Original agent profile not found.");
      }

      const locationsArray = serviceLocations.split(',').map(l => l.trim()).filter(l => l);
      
      await setDoc(doc(db, 'users', firebaseUID), {
        ...oldDocSnap.data(),
        id: firebaseUID,
        companyName,
        contactPhone,
        serviceLocations: locationsArray,
        passwordHash: password,
        status: 'PENDING', // PENDING review by admin
        updatedAt: new Date().toISOString(),
      });
      
      // Delete old document
      await deleteDoc(oldDocRef);

      // 3. Create Subscription
      await createSubscription(
        firebaseUID,
        oldDocSnap.data().name || companyName,
        agentEmail,
        selectedPlanId
      );

      // 4. Complete onboarding
      // Pass the new firebaseUID to avoid 'not found' errors if completeAgentOnboarding updates the doc
      await completeAgentOnboarding(firebaseUID, password, token!);

      setStep('success');
    } catch (err: any) {
      console.error(err);
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
            <p className="text-slate-400 mb-6">Your profile is submitted and pending admin review. You can log in, but features may be restricted until approved.</p>
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 overflow-y-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Agent Onboarding</h1>
          <p className="text-slate-400 font-medium">Complete your profile to get started</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-slate-800 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center mb-6">
              {error}
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleNextToBusiness} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold text-white mb-4">Step 1: Account Security</h2>
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
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
              >
                Next Step
              </button>
            </form>
          )}

          {step === 'business' && (
            <form onSubmit={handleNextToPlan} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-white mb-4">Step 2: Business Profile</h2>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                <input
                  required
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Service Locations (Comma Separated)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Addis Ababa, Hawassa"
                  value={serviceLocations}
                  onChange={(e) => setServiceLocations(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {step === 'plan' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-white mb-4">Step 3: Select Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {plans.map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlanId === plan.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                        {plan.category === 'EARTH_MOVING' ? 'Earth' : 'Cars'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">
                      {plan.price.toLocaleString()} <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ETB / {plan.durationMonths === 12 ? 'yr' : plan.durationMonths + ' mo'}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Up to {plan.maxVehicles === 9999 ? 'Unlimited' : plan.maxVehicles} machinery
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('business')}
                  className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedPlanId}
                  className="w-2/3 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Finishing...</span>
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AgentActivationPage;
