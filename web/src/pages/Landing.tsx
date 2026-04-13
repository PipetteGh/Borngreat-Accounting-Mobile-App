import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Shield, Zap, 
  BarChart3, Globe, Activity, 
  CheckCircle2, AlertTriangle, Search, 
  Target, PieChart, Lock, TrendingDown, LayoutDashboard,
  Plus, MessageSquare, ShieldCheck, Smartphone
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const navHeight = 64;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    document.title = 'Borngreat Accounting - Personal Financial Intelligence | Track Income, Manage Expenses & Build Budgets';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Borngreat Accounting is a free personal finance platform that helps you track income, manage expenditure, set budget limits, and gain real-time financial clarity. Built by Soluotech.');
    }
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const problems = [
    {
      icon: <TrendingDown className="w-5 h-5 text-accentOrange" />,
      title: "Where did it go?",
      desc: "Most people lose track of 30% of their minor daily outflows, leading to month-end anxiety."
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-accentOrange" />,
      title: "Budget Blindness",
      desc: "Without real-time monitoring, 70% of individuals overspend in categories they care about most."
    },
    {
      icon: <Search className="w-5 h-5 text-accentOrange" />,
      title: "Manual Chaos",
      desc: "Scattered receipts and mental math are the biggest barriers to long-term financial growth."
    }
  ];

  const showcaseItems = [
    {
      title: "Precision Pulse Dashboard",
      badge: "The Solution",
      description: "We eliminate 'Financial Fog'. See your exact trajectory (Income vs. Outflow) in real-time, across all your bank and cash accounts.",
      image: "/borngreat_dashboard_mockup_1775963202740.png",
      color: "accentPurple"
    },
    {
      title: "Effortless Inflow Logging",
      badge: "The Gap-Filler",
      description: "Stop manual entries. Categorize every coin with a single tap. Borngreat turns messy data into actionable financial stories.",
      image: "/borngreat_income_feature_1775963796962.png",
      color: "accentGreen"
    },
    {
      title: "Discipline by Design",
      badge: "The Strategy",
      description: "Set hard limits for expenditures. Our usage intensity monitoring warns you before you cross the line, not after.",
      image: "/borngreat_budget_analytics_1775963818651.png",
      color: "accentCyan"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accentPurple/30 overflow-x-hidden font-outfit">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 container mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentOrange/10 border border-accentOrange/20 text-accentOrange text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
            <Activity className="w-4 h-4" /> RECOVER YOUR FINANCIAL POWER
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-medium leading-[1.0] tracking-tighter mb-8"
          >
            Master Your Money, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentPurple via-accentCyan to-accentGreen">End the Chaos.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-secondary text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-normal"
          >
            Most personal accounts fail because of invisible outflows. Borngreat brings absolute clarity to your income, expenditure, and budget targets.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {token ? (
                <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-primary text-white px-10 h-16 rounded-2xl text-lg font-semibold shadow-2xl hover:scale-105 transition-transform gap-2">
                    Open Dashboard <LayoutDashboard className="w-5 h-5" />
                </Button>
            ) : (
                <Button onClick={() => navigate('/register')} size="lg" className="bg-primary text-white px-10 h-16 rounded-2xl text-lg font-semibold shadow-2xl hover:scale-105 transition-transform">
                    Start Your Pro Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            )}

            <a href="#" className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">Available On</p>
                    <p className="text-sm font-bold tracking-tight">Android App</p>
                </div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* The Problem Identification Section */}
      <section id="problem" className="py-24 border-y border-white/5 bg-accentOrange/[0.02]">
        <div className="container mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-12">
              {problems.map((p, i) => (
                 <motion.div 
                   key={i}
                   {...fadeIn}
                   className="p-8 rounded-[32px] bg-white border border-border shadow-sm hover:shadow-xl transition-all"
                 >
                    <div className="w-10 h-10 bg-accentOrange/10 rounded-2xl flex items-center justify-center mb-6">
                       {p.icon}
                    </div>
                    <h3 className="text-lg font-medium mb-4 tracking-tight uppercase text-primary">{p.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed font-normal">{p.desc}</p>
                 </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Interface Showcase - The "Seeing is Believing" Section */}
      <section id="showcase" className="py-24 bg-surface/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-medium mb-6 tracking-tighter">The Gap Resolvers.</h2>
            <p className="text-secondary text-lg leading-relaxed font-normal">We analyzed the failures of manual tracking and designed Borngreat to solve exactly those gaps. No more blind-spending.</p>
          </div>
          
          <div className="space-y-32">
            {showcaseItems.map((item, idx) => (
              <motion.div 
                key={idx}
                {...fadeIn}
                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
              >
                <div className="flex-1 space-y-6">
                  <div className={`px-4 py-1.5 rounded-full bg-${item.color}/10 border border-${item.color}/20 text-${item.color} text-[10px] font-semibold uppercase tracking-[0.2em] w-fit`}>
                    {item.badge}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-medium tracking-tighter leading-tight">{item.title}</h3>
                  <p className="text-secondary text-lg leading-relaxed font-normal">{item.description}</p>
                  <ul className="space-y-4 pt-4">
                     {[
                        "Real-time liquidity monitoring",
                        "Category-based growth analytics",
                        "Predictive budget alerts"
                     ].map((text, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium text-sm tracking-tight">
                           <div className={`p-1 rounded-full bg-${item.color}/20 text-${item.color}`}>
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                           {text}
                        </li>
                     ))}
                  </ul>
                </div>
                <div className="flex-1 w-full translate-z-0">
                   <div className="relative group">
                      <div className={`absolute inset-0 bg-${item.color}/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="rounded-[40px] border border-white/10 shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500 bg-surface overflow-hidden">
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                        />
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote / Proof */}
      <section className="py-24 border-t border-border/30 bg-surface">
         <div className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter leading-snug mb-10 text-primary">
              "Borngreat didn't just track my money; it changed my entire financial psychology."
            </h2>
            <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-12 rounded-full bg-accentPurple flex items-center justify-center font-semibold text-white">PB</div>
               <div className="text-left font-outfit">
                  <p className="font-semibold uppercase tracking-widest text-sm text-primary">Peter Borngreat</p>
                  <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">Founder of Borngreat Accounting</p>
               </div>
            </div>
         </div>
      </section>

      {/* Global Partnerships Trust Bar */}
      <section className="py-16 border-y border-border/30 bg-white">
         <div className="container mx-auto px-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 mb-8">Trusted By Global Partners Via Soluotech</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
               {['Cloudflare', 'A10 Networks', 'Argu AI'].map((partner) => (
                  <div key={partner} className="text-secondary/30 text-lg md:text-xl font-black uppercase tracking-widest hover:text-primary/60 transition-colors">
                     {partner}
                  </div>
               ))}
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary/30 mt-6">Cybersecurity • Government & Public Institutions • Financial Institutions • Private Sector</p>
         </div>
      </section>

      {/* Revised Pricing Section - Elite Tiering */}
      <section id="pricing" className="py-32 bg-surface/30 border-y border-white/5">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
               <h2 className="text-4xl md:text-6xl font-medium mb-6 tracking-tighter">Choose Your Path.</h2>
               <p className="text-secondary text-lg font-normal">Pricing designed for global accessibility and rapid evolution. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
               {/* Free Tier */}
               <motion.div 
                 {...fadeIn}
                 className="p-10 rounded-[48px] bg-white border border-border shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accentGreen/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="mb-12">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accentGreen">Essential Edition</span>
                     <h3 className="text-4xl font-medium mt-4 tracking-tighter">Free Forever</h3>
                     <p className="text-primary/40 text-sm mt-2 font-medium">Standard Personal Accounting</p>
                  </div>
                  
                  <ul className="space-y-5 mb-12 flex-1">
                     {[
                        "Income and Inflows",
                        "Expenditure and Outflows",
                        "Manual Budget Management",
                        "Real-time Analytics",
                        "Unlimited Inflow Records",
                        "Global Currency Support",
                        "And many more..."
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight text-primary">
                           <div className="p-1 rounded-full bg-accentGreen/10 text-accentGreen">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                           </div>
                           {item}
                        </li>
                     ))}
                  </ul>

                  <Button onClick={() => navigate('/register')} className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-semibold hover:scale-[1.02] transition-transform">
                     Get Started Free
                  </Button>
               </motion.div>

               {/* Pro Tier - Light Theme */}
               <motion.div 
                 {...fadeIn}
                 className="p-10 rounded-[48px] bg-white text-primary border border-border/50 shadow-2xl hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col"
               >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accentPurple/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                  <div className="mb-12 relative z-10">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accentPurple">Elite Edition</span>
                     <div className="flex items-baseline gap-2 mt-4">
                        <h3 className="text-5xl font-medium tracking-tighter text-primary">$10.00</h3>
                        <span className="text-secondary/40 text-sm font-medium uppercase tracking-widest">One Time</span>
                     </div>
                     <p className="text-secondary/60 text-sm mt-2 font-medium">Build Your Ideal Platform</p>
                  </div>
                  
                  <ul className="space-y-5 mb-12 flex-1 relative z-10">
                     <li className="flex items-start gap-4 p-4 rounded-2xl bg-accentPurple/5 border border-accentPurple/10">
                        <MessageSquare className="w-6 h-6 text-accentPurple shrink-0 mt-1" />
                        <div>
                           <h5 className="font-bold text-sm uppercase tracking-tight text-primary">Feature Request Priority</h5>
                           <p className="text-xs text-secondary/70 leading-relaxed font-normal mt-1">Directly suggest and prioritize the next batch of features on our roadmap.</p>
                        </div>
                     </li>
                     {[
                        "All Free Features Included",
                        "Roadmap Priority Access",
                        "Exclusive Beta Features",
                        "Professional Support Channel",
                        "Direct Access to CEO"
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight text-secondary">
                           <div className="p-1 rounded-full bg-accentPurple/10 text-accentPurple">
                              <Zap className="w-3.5 h-3.5" />
                           </div>
                           {item}
                        </li>
                     ))}
                  </ul>
                  <Button onClick={() => window.location.href='/contact?subject=ProTier'} className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-semibold hover:scale-[1.02] transition-transform relative z-10">
                     Contact Sales
                  </Button>
               </motion.div>
            </div>
         </div>
      </section>

      <PublicFooter />
    </div>
  );
}
