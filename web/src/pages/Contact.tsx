import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Mail, Phone, MapPin, ShieldCheck, Globe, Zap, Cpu, Award } from 'lucide-react';

export default function Contact() {
    useEffect(() => {
        document.title = 'Contact | Borngreat Accounting - Get In Touch With Our Team';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Connect with the Borngreat Accounting technical team. Get expert support from our cybersecurity and financial systems specialists based at Soluotech.');
        }
        window.scrollTo(0, 0);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const coreCompetencies = [
        "Cybersecurity Practitioner",
        "DevOps Engineer",
        "Solution Architect",
        "System Administrator",
        "IT Consultant",
        "ISO/IEC 27001 Auditor",
        "ISO 42001 Implementer",
        "ISO 3100 Implementer",
        "ISC2 AI/ML Engineer"
    ];

    return (
        <div className="min-h-screen bg-background font-outfit text-primary selection:bg-accentPurple/30">
            <PublicNavbar />
            
            <main className="pt-32 pb-20 px-6 container mx-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-20">
                        <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                            <ShieldCheck className="w-4 h-4" /> SECURE COMMUNICATION
                        </motion.div>
                        <motion.h1 
                            {...fadeIn}
                            className="text-5xl md:text-8xl font-medium tracking-tighter leading-[0.9] text-primary"
                        >
                            Engineered for <br />
                            <span className="text-secondary opacity-30">High-Stakes Support.</span>
                        </motion.h1>
                    </header>

                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Contact Info & CEO Profile */}
                        <div className="lg:col-span-12">
                             <div className="grid lg:grid-cols-2 gap-16 items-start">
                                {/* Left Side: Profile */}
                                <motion.section {...fadeIn} className="space-y-12">
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 rounded-[32px] bg-primary text-white flex items-center justify-center font-black text-2xl shadow-2xl">
                                            PB
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-medium tracking-tighter">Peter Borngreat-Mensah</h2>
                                            <p className="text-accentCyan font-black text-xs uppercase tracking-[0.2em] mt-1">CEO of Soluotech</p>
                                        </div>
                                        <p className="text-secondary leading-relaxed font-normal max-w-lg">
                                            A multidisciplinary Cybersecurity Specialist and Solutions Architect with a global footprint in financial and institutional technology. Peter has dedicated his career to building bulletproof systems that balance high-performance with absolute security.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Direct Dial</h4>
                                            <a href="tel:+233598869170" className="flex items-center gap-3 text-lg font-medium hover:text-accentCyan transition-colors">
                                                <Phone className="w-5 h-5 opacity-20" /> +233 59 886 9170
                                            </a>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Official Email</h4>
                                            <a href="mailto:info@soluotech.com" className="flex items-center gap-3 text-lg font-medium hover:text-accentCyan transition-colors">
                                                <Mail className="w-5 h-5 opacity-20" /> info@soluotech.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-border">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-8">Professional Trajectory</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 rounded-3xl bg-surface border border-border group hover:border-accentCyan/30 transition-all">
                                                <Globe className="w-8 h-8 text-accentCyan mb-4 group-hover:scale-110 transition-transform" />
                                                <h5 className="font-bold mb-2 uppercase text-xs tracking-tighter">Global Partnerships</h5>
                                                <p className="text-xs text-secondary/70 font-normal leading-relaxed">Worked with Cloudflare, A10 Networks, and Argu AI via partnered companies for global cybersecurity and integrated solutions.</p>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-surface border border-border group hover:border-accentPurple/30 transition-all">
                                                <Award className="w-8 h-8 text-accentPurple mb-4 group-hover:scale-110 transition-transform" />
                                                <h5 className="font-bold mb-2 uppercase text-xs tracking-tighter">Institutional Solutions</h5>
                                                <p className="text-xs text-secondary/70 font-normal leading-relaxed">Engineered robust infrastructure for government and public institutions, financial institutions, and the private sector.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Right Side: Technical Specs */}
                                <motion.section {...fadeIn} className="bg-primary text-white p-10 md:p-16 rounded-[48px] relative overflow-hidden h-fit">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accentCyan/20 to-transparent opacity-50" />
                                    <div className="relative z-10 space-y-12">
                                        <div className="flex items-center gap-4">
                                            <Cpu className="w-10 h-10 text-accentCyan" />
                                            <h3 className="text-2xl font-medium tracking-tight uppercase">Technical Core</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accentCyan">Competency Stack</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {coreCompetencies.map((skill, i) => (
                                                    <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium tracking-tight">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-5 h-5 text-accentCyan" />
                                                <p className="text-sm font-medium tracking-tight leading-relaxed">Member of ISC2 AI/ML Engineers Association</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-5 h-5 text-accentCyan" />
                                                <p className="text-sm font-medium tracking-tight leading-relaxed">ISO/IEC Auditor & Implementation Expert</p>
                                            </div>
                                        </div>

                                        <div className="pt-12">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Official HQ</p>
                                            <div className="space-y-2">
                                                <p className="text-xl font-medium tracking-tight">Soluotech Systems</p>
                                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                                    <MapPin className="w-4 h-4" /> Global Operations Hub
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                             </div>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
