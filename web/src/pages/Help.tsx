import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Search, Book, MessageCircle, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Help() {
    useEffect(() => {
        document.title = 'Help Center | Borngreat Accounting - FAQs & Support';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Find answers to frequently asked questions about Borngreat Accounting. Learn how to track income, manage expenses, and protect your financial data with our knowledge base.');
        }
        window.scrollTo(0, 0);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const faqs = [
        {
            q: "How secure is my financial data?",
            a: "Absolute security is our baseline. Borngreat is engineered by Peter Borngreat-Mensah, a Cybersecurity Specialist and ISO/IEC 27001 Auditor. Your data is encrypted at rest and in transit using bank-grade protocols."
        },
        {
            q: "Is Borngreat really 'Free Forever'?",
            a: "Yes. The core personal accounting platform—including income/expenditure tracking, account management, and analytics—is free. We believe everyone deserves financial clarity."
        },
        {
            q: "What is the 'Pro Version' for $10?",
            a: "The Pro version is a one-time payment that grants you 'Feature Request Priority'. This allows you to directly influence the development roadmap and suggest specific features you'd like to see added to the platform."
        },
        {
            q: "Can I manage multiple bank accounts?",
            a: "Absolutely. You can add as many manual bank, cash, or digital wallet accounts as you need to get a holistic view of your global liquidity."
        }
    ];

    return (
        <div className="min-h-screen bg-background font-outfit text-primary selection:bg-accentPurple/30">
            <PublicNavbar />
            
            <main className="pt-32 pb-20 px-6 container mx-auto">
                {/* Hero */}
                <header className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentOrange/10 border border-accentOrange/20 text-accentOrange text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                        <HelpCircle className="w-4 h-4" /> KNOWLEDGE BASE
                    </motion.div>
                    <motion.h1 
                        {...fadeIn}
                        className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1] text-primary"
                    >
                        How can we help <br />
                        <span className="text-secondary opacity-30">optimize your finances?</span>
                    </motion.h1>
                </header>

                {/* Categories */}
                <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
                    {[
                        { icon: <Book className="w-6 h-6" />, title: "Getting Started", desc: "Learn the basics of inflow/outflow logging." },
                        { icon: <ShieldCheck className="w-6 h-6 text-accentCyan" />, title: "Security & Privacy", desc: "Our ISO-certified approach to your data." },
                        { icon: <MessageCircle className="w-6 h-6 text-accentPurple" />, title: "Contact Support", desc: "Speak directly with our technical team." }
                    ].map((idx, i) => (
                        <motion.div 
                            key={i}
                            {...fadeIn} 
                            className="p-8 rounded-[40px] border border-border bg-white shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                <div className="group-hover:text-white transition-colors">{idx.icon}</div>
                            </div>
                            <h3 className="text-xl font-medium tracking-tight uppercase mb-4">{idx.title}</h3>
                            <p className="text-secondary text-sm leading-relaxed font-normal mb-8">{idx.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                                Explore <ArrowRight className="w-3 h-3" />
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* FAQs */}
                <section className="max-w-3xl mx-auto py-24 border-t border-border">
                    <h2 className="text-3xl font-medium tracking-tighter mb-12 uppercase">Frequently Asked Questions</h2>
                    <div className="space-y-12">
                        {faqs.map((f, i) => (
                            <motion.div key={i} {...fadeIn} className="space-y-4">
                                <h4 className="text-lg font-bold tracking-tight text-primary uppercase">{f.q}</h4>
                                <p className="text-secondary leading-relaxed font-normal">{f.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Still Need Help? */}
                <section className="py-24 px-8 rounded-[64px] bg-accentPurple/5 border border-accentPurple/10 text-center max-w-4xl mx-auto mt-24">
                    <h3 className="text-3xl font-medium tracking-tighter mb-4 uppercase">Still Have Questions?</h3>
                    <p className="text-secondary mb-10 font-normal">Our team is ready to assist you with any technical or financial management queries.</p>
                    <button className="bg-primary text-white px-10 h-16 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition-transform" onClick={() => window.location.href = '/contact'}>
                        Get in Touch
                    </button>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
