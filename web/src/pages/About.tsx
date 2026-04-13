import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Heart, Target, Users, BookOpen } from 'lucide-react';

export default function About() {
    useEffect(() => {
        document.title = 'About Us | Borngreat Accounting - Our Mission & Story';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Discover the story behind Borngreat Accounting. Built by financial intelligence experts to bring absolute clarity, security, and precision to your daily personal accounting.');
        }
        window.scrollTo(0, 0);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-background font-outfit text-primary selection:bg-accentPurple/30">
            <PublicNavbar />
            
            <main className="pt-32 pb-20 px-6 container mx-auto">
                {/* Hero Header */}
                <header className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                        <Heart className="w-4 h-4 text-accentPurple" /> OUR MISSION
                    </motion.div>
                    <motion.h1 
                        {...fadeIn}
                        className="text-5xl md:text-7xl font-medium leading-[1.1] tracking-tighter mb-8"
                    >
                        Created by Experience, <br />
                        <span className="text-secondary opacity-40">Refined for Everyone.</span>
                    </motion.h1>
                    <motion.p 
                        {...fadeIn}
                        className="text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Borngreat was born out of a simple observation: most financial tools are too complex for the basics, yet too vague to drive real change.
                    </motion.p>
                </header>

                {/* The Story */}
                <section className="grid md:grid-cols-2 gap-16 items-center mb-32 max-w-5xl mx-auto">
                    <motion.div {...fadeIn} className="space-y-6">
                        <div className="w-12 h-12 bg-accentPurple/10 rounded-2xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-accentPurple" />
                        </div>
                        <h2 className="text-3xl font-medium tracking-tighter uppercase">The Inspiration</h2>
                        <div className="space-y-4 text-secondary leading-relaxed">
                            <p>
                                My journey into developing Borngreat Accounting didn't start in a boardroom—it started with my own personal experience. I realized that the foundation of financial freedom isn't complex derivatives; it's the <strong>basics of daily management</strong>.
                            </p>
                            <p>
                                I saw how easily "invisible" outflows could derail even the most disciplined earners. Most people lose track of a significant portion of their minor expenses, leading to unnecessary stress at the end of every month. I decided to build a solution that turns these basics into a lifestyle.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div {...fadeIn} className="relative group">
                         <div className="absolute inset-0 bg-accentPurple/10 blur-[80px] rounded-full opacity-50" />
                         <div className="relative z-10 p-8 rounded-[40px] border border-border bg-surface shadow-2xl">
                             <h4 className="text-lg font-black tracking-widest uppercase mb-4 opacity-30">Founder's Note</h4>
                             <p className="text-xl font-medium leading-relaxed">
                                "Financial management should be a source of power, not a source of confusion. Borngreat is my contribution to making financial clarity accessible to all."
                             </p>
                         </div>
                    </motion.div>
                </section>

                {/* Who is this for? */}
                <section className="py-24 rounded-[64px] bg-primary text-white overflow-hidden relative mb-32">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accentPurple/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto px-12 relative z-10 text-center max-w-4xl">
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-8">Who can use this?</h2>
                        <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-16">
                            The simple answer is: <strong>Anyone who wants to monitor their finances.</strong>
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Daily Earners", desc: "Keep track of every inflow as it happens." },
                                { title: "Budget Seekers", desc: "Set hard limits and stick to them with alerts." },
                                { title: "Growth Minded", desc: "Analyze historical data to predict future savings." }
                            ].map((card, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors">
                                    <h4 className="font-black uppercase tracking-widest text-[11px] mb-2 text-accentCyan">{card.title}</h4>
                                    <p className="text-sm text-white/60 leading-relaxed font-normal">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Closing */}
                <section className="text-center max-w-2xl mx-auto">
                    <Target className="w-12 h-12 text-accentPurple mx-auto mb-8 opacity-20" />
                    <h3 className="text-2xl font-medium tracking-tighter uppercase mb-6 text-secondary">It's worth sharing.</h3>
                    <p className="text-secondary leading-relaxed font-normal">
                        Your financial health is your greatest asset. We're here to help you guard it with precision-engineered tools that stay out of your way and focus on the results.
                    </p>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
