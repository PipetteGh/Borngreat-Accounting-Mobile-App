import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Rocket, Wallet, Globe,
  ArrowRight, CheckCircle2,
  CreditCard, Sparkles, Navigation2, X
} from 'lucide-react';
import { accountService } from '@/services/accountService';
import api from '@/services/api';
import { toast } from 'sonner';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';

export function OnboardingModal() {
  const { user, showOnboarding, setOnboardingComplete, updateUser } = useAuthStore();
  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [runTour, setRunTour] = useState(false);
  
  // Setup States
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('cash');
  const [accBalance, setAccBalance] = useState('');
  const [currency, setCurrency] = useState(user?.currency_symbol || '$');
  const [country, setCountry] = useState('');

  // Server-side check for existing accounts to avoid showing wizard to returning users
  React.useEffect(() => {
    if (showOnboarding) {
      accountService.getAccounts().then(accounts => {
        if (accounts && accounts.length > 0) {
          // Returning user detected on new device - auto complete onboarding
          setOnboardingComplete();
        }
      }).catch(() => {
        // Silently fail, let the modal show if we can't verify
      });
    }
  }, [showOnboarding, setOnboardingComplete]);

  if (!showOnboarding && !runTour) return null;

  const handleCreateAccount = async () => {
    if (!accName || !accBalance) {
      toast.error('Financial setup required');
      return;
    }
    setLoading(true);
    try {
      await accountService.createAccount({
        name: accName,
        type: accType,
        initial_balance: parseFloat(accBalance)
      });
      setWizardStep(2);
    } catch (error) {
      toast.error('Failed to initialize account');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/update-profile', { 
        currency_symbol: currency,
        country: country 
      });
      if (res.data.user) updateUser(res.data.user);
      setWizardStep(3);
    } catch (error) {
      setWizardStep(3);
    } finally {
      setLoading(false);
    }
  };

  const startProductTour = () => {
    setWizardStep(4);
    setRunTour(true);
  };

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
      setOnboardingComplete();
    }
  };

  const tourSteps: Step[] = [
    {
      target: '#sidebar-brand',
      content: 'Welcome to Borngreat! This is your command center for personal growth.',
      placement: 'right',
      title: 'Command Center'
    },
    {
      target: '#welcome-message',
      content: 'Personalized greeting and current tracking period indicators.',
      placement: 'bottom',
      title: 'Hello User'
    },
    {
      target: '#period-switcher',
      content: 'Switch between Weekly, Monthly, or Yearly views to analyze trends.',
      placement: 'bottom',
      title: 'Time Travel'
    },
    {
      target: '#net-flow-card',
      content: 'Your Global Pulse. Monitor net growth and savings efficiency here.',
      placement: 'bottom',
      title: 'Financial Health'
    },
    {
      target: '#accounts-carousel',
      content: 'Your liquid assets across Bank, Cash, and Mobile Money wallets.',
      placement: 'top',
      title: 'Asset Monitor'
    },
    {
      target: '#nav-income',
      content: 'Log your earnings, salaries, and dividends here to see growth.',
      placement: 'right',
      title: 'Earnings Flow'
    },
    {
      target: '#nav-expenditure',
      content: 'Where the magic happens. Categorize expenses to reclaim your lost 30%.',
      placement: 'right',
      title: 'Spending Control'
    },
    {
      target: '#budget-oversight',
      content: 'Our ERP-grade budget oversight. usage intensity warns you of overspending.',
      placement: 'top',
      title: 'Discipline Engine'
    },
    {
      target: '#user-profile',
      content: 'Manage your profile and regional settings any time from here.',
      placement: 'bottom',
      title: 'Identity'
    }
  ];

  return (
    <>
      <Joyride
        run={runTour}
        steps={tourSteps}
        onEvent={handleJoyrideEvent}
        continuous
        showProgress
        showSkipButton
        disableScrolling={false}
        scrollToSteps={true}
        styles={{
          options: {
            primaryColor: '#7c5dfa',
            zIndex: 10000,
            backgroundColor: '#ffffff',
            textColor: '#1B1B2F',
            arrowColor: '#ffffff',
          },
          tooltipContainer: {
            textAlign: 'left',
            borderRadius: '24px',
            padding: '10px'
          },
          buttonNext: {
            borderRadius: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '11px',
            padding: '12px 20px',
            letterSpacing: '1px'
          },
          buttonBack: {
            marginRight: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '11px',
            color: '#8E92A8'
          }
        }}
      />

      <AnimatePresence>
        {showOnboarding && wizardStep < 4 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setOnboardingComplete()}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-secondary/5 hover:bg-secondary/10 flex items-center justify-center text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 text-center">
                 {wizardStep === 1 && (
                    <div className="animate-in fade-in zoom-in duration-500">
                       <div className="w-14 h-14 bg-accentGreen/10 rounded-xl flex items-center justify-center text-accentGreen mx-auto mb-6 shadow-inner text-sm">
                          <CreditCard className="w-7 h-7" />
                       </div>
                       <h2 className="text-3xl font-black text-primary tracking-tighter mb-2">INITIALIZE SETUP</h2>
                       <p className="text-secondary text-sm mb-10 font-bold opacity-80 uppercase tracking-widest">Step 1: Active Accounts</p>
                       
                       <div className="space-y-5 text-left mb-10">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-secondary/60">Account Label</Label>
                             <Input 
                                placeholder="e.g. Daily Cash" 
                                value={accName}
                                onChange={(e) => setAccName(e.target.value)}
                                className="h-11 rounded-xl border-border/50 bg-secondary/5 font-bold"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-secondary/60">Type</Label>
                                <select 
                                   value={accType}
                                   onChange={(e) => setAccType(e.target.value)}
                                   className="w-full h-11 rounded-xl border border-border/50 bg-secondary/5 px-4 text-sm font-bold appearance-none outline-none"
                                >
                                   <option value="cash">Cash</option>
                                   <option value="bank">Bank</option>
                                   <option value="mobile_money">Mobile Money</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-secondary/60">Balance</Label>
                                <Input 
                                   type="number"
                                   placeholder="0.00" 
                                   value={accBalance}
                                   onChange={(e) => setAccBalance(e.target.value)}
                                   className="h-11 rounded-xl border-border/50 bg-secondary/5 font-bold"
                                />
                             </div>
                          </div>
                       </div>
                       
                       <Button 
                         disabled={loading}
                         onClick={handleCreateAccount} 
                         className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all mb-4"
                       >
                          {loading ? "Activating..." : "Continue to Identity"}
                       </Button>
                       <button onClick={() => setOnboardingComplete()} className="text-[10px] font-black uppercase text-secondary/40 tracking-widest hover:text-secondary transition-colors">Skip Setup for now</button>
                    </div>
                 )}

                 {wizardStep === 2 && (
                    <div className="animate-in fade-in zoom-in duration-500">
                       <div className="w-20 h-20 bg-accentCyan/10 rounded-3xl flex items-center justify-center text-accentCyan mx-auto mb-8 shadow-inner">
                          <Globe className="w-10 h-10" />
                       </div>
                       <h2 className="text-3xl font-black text-primary tracking-tighter mb-2">LOCALIZATION</h2>
                       <p className="text-secondary text-sm mb-10 font-bold opacity-80 uppercase tracking-widest">Step 2: Currency & Region</p>
                       
                       <div className="space-y-5 text-left mb-10">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-secondary/60">Currency Symbol</Label>
                             <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full h-12 rounded-xl border border-border/50 bg-secondary/5 px-6 text-xl font-black appearance-none outline-none"
                             >
                                <option value="GH₵">GH₵ (Ghana)</option>
                                <option value="₦">₦ (Nigeria)</option>
                                <option value="$">$ (USA / Global)</option>
                                <option value="KSh">KSh (Kenya)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-secondary/60">Region/Country</Label>
                             <Input 
                                placeholder="Your Country" 
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="h-12 rounded-2xl border-border/50 bg-secondary/5 font-bold"
                             />
                          </div>
                       </div>
                       
                       <Button 
                         disabled={loading}
                         onClick={handleSavePreferences} 
                         className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all mb-4"
                       >
                          {loading ? "Syncing..." : "Finalize Config"}
                       </Button>
                       <button onClick={() => setOnboardingComplete()} className="text-[10px] font-black uppercase text-secondary/40 tracking-widest hover:text-secondary transition-colors">Skip Setup for now</button>
                    </div>
                 )}

                 {wizardStep === 3 && (
                    <div className="animate-in fade-in zoom-in duration-500">
                       <div className="w-20 h-20 bg-accentPurple/10 rounded-3xl flex items-center justify-center text-accentPurple mx-auto mb-8 shadow-inner">
                          <Sparkles className="w-10 h-10" />
                       </div>
                       <span className="text-[10px] font-black text-accentPurple uppercase tracking-[0.3em] mb-4 block">SYSTEMS ENGAGED</span>
                       <h2 className="text-3xl font-black text-primary tracking-tighter mb-8 leading-tight">MASTER THE<br/>NAVIGATIONS</h2>
                       
                       <div className="p-5 rounded-xl bg-secondary/5 border border-border text-left space-y-3 mb-8">
                          <div className="flex gap-4">
                             <CheckCircle2 className="w-5 h-5 text-accentGreen shrink-0" />
                             <p className="text-xs font-bold text-primary">Regional preference indexed.</p>
                          </div>
                          <div className="flex gap-4">
                             <CheckCircle2 className="w-5 h-5 text-accentGreen shrink-0" />
                             <p className="text-xs font-bold text-primary">Initial wallet active.</p>
                          </div>
                       </div>
                       
                       <Button 
                         onClick={startProductTour} 
                         className="group w-full h-14 rounded-xl bg-accentPurple text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accentPurple/20 flex items-center justify-center gap-3"
                       >
                          Start Interactive Tutorial <Navigation2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                 )}
              </div>

              <div className="bg-secondary/5 py-4 flex justify-center gap-2">
                 {[1,2,3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full ${i === wizardStep ? 'w-8 bg-accentPurple' : 'w-1.5 bg-secondary/20'}`} />
                 ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
