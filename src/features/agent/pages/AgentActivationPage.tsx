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
  const [duration, setDuration] = useState<number>(3);

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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(53,92,255,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,0,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-md w-full relative z-10">
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">Invitation Invalid</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error || 'Something went wrong'}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md shadow-brand-main/10"
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-md w-full relative z-10">
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">Setup Complete!</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Your profile is submitted and pending admin review. You can log in, but features may be restricted until approved.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-[#10B981] hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md shadow-emerald-500/10"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 overflow-y-auto relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(53,92,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 bottom-0 opacity-15 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, rgba(53, 92, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(53, 92, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Fleet Activation Console</h1>
          <p className="text-slate-400 font-medium">Complete your onboarding profile to initialize Fleet Command</p>
        </div>

        <div className="bg-slate-900/35 backdrop-blur-xl p-8 rounded-[32px] border border-slate-800 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-center mb-6">
              {error}
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleNextToBusiness} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-black text-white mb-4 uppercase tracking-wider border-b border-slate-800 pb-3">Step 1: Security Credentials</h2>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Assigned Email</label>
                <input
                  type="email"
                  value={agentEmail}
                  disabled
                  className="w-full px-5 py-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-500 outline-none cursor-not-allowed font-semibold text-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">New Security Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-main transition-all font-semibold text-sm focus:ring-4 focus:ring-brand-main/5"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-main transition-all font-semibold text-sm focus:ring-4 focus:ring-brand-main/5"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md shadow-brand-main/20 hover:-translate-y-0.5 duration-200"
              >
                Next Step
              </button>
            </form>
          )}

          {step === 'business' && (
            <form onSubmit={handleNextToPlan} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-black text-white mb-4 uppercase tracking-wider border-b border-slate-800 pb-3">Step 2: Business Profile</h2>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company / Brand Name</label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-main transition-all font-semibold text-sm focus:ring-4 focus:ring-brand-main/5"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                <input
                  required
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-main transition-all font-semibold text-sm focus:ring-4 focus:ring-brand-main/5"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Service Depot Locations (Comma Separated)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Addis Ababa, Hawassa"
                  value={serviceLocations}
                  onChange={(e) => setServiceLocations(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-main transition-all font-semibold text-sm focus:ring-4 focus:ring-brand-main/5"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-4 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md shadow-brand-main/20 hover:-translate-y-0.5 duration-200"
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {step === 'plan' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-black text-white mb-4 uppercase tracking-wider border-b border-slate-800 pb-3">Step 3: Select Plan</h2>
              <div className="flex bg-slate-950/70 p-1 rounded-xl mb-6 border border-slate-850">
                {[3, 6, 12].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      duration === d
                        ? 'bg-brand-main text-white shadow-md shadow-brand-main/20'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {d === 12 ? '1 Year' : `${d} Months`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {[5, 15, 9999].map(max => {
                  const tierPlans = plans.filter(p => p.maxVehicles === max);
                  const plan = tierPlans.find(p => p.durationMonths === duration) || tierPlans[0];
                  
                  if (!plan) return null;

                  return (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                        selectedPlanId === plan.id 
                          ? 'border-brand-main bg-brand-main/[0.04] shadow-md shadow-brand-main/5' 
                          : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${
                            max === 9999 ? 'text-brand-accent' : max === 15 ? 'text-blue-400' : 'text-slate-450'
                          }`}>
                            {max === 9999 ? 'Enterprise' : max === 15 ? 'Professional' : 'Basic'}
                          </span>
                          <h3 className="font-black text-white text-lg">
                            {max === 9999 ? 'Limitless' : `${max} Machineries`}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white leading-none mb-1">
                            {plan.price.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                            ETB / {plan.durationMonths === 12 ? 'Year' : `${plan.durationMonths} Mo`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                        {max === 9999 ? 'Unlimited Fleet Size' : `Up to ${max} active vehicles`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('business')}
                  className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedPlanId}
                  className="w-2/3 py-4 bg-[#10B981] hover:bg-[#0EA271] disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 hover:-translate-y-0.5 duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Completing Onboarding...</span>
                    </>
                  ) : (
                    'Activate Account'
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
