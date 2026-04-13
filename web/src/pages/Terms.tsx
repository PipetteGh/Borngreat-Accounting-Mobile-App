import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { FileText } from 'lucide-react';

export default function Terms() {
    useEffect(() => {
        document.title = 'Terms of Service | Borngreat Accounting - Legal Framework';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Review the Borngreat Accounting Terms of Service. Understand our legal framework, user responsibilities, and the terms of our free and pro edition accounting services.');
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
            
            <main className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
                <header className="mb-20 text-center md:text-left">
                    <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                        <FileText className="w-4 h-4" /> LEGAL FRAMEWORK
                    </motion.div>
                    <motion.h1 
                        {...fadeIn}
                        className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1] text-primary"
                    >
                        Terms of Service.
                    </motion.h1>
                    <motion.p {...fadeIn} className="text-secondary mt-4 font-normal text-sm uppercase tracking-[0.1em]">
                        Last Updated: April 12, 2026
                    </motion.p>
                </header>

                <div className="space-y-16 text-secondary leading-relaxed font-normal">
                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">1. Agreement to Terms</h2>
                        <p>
                            By accesssing and using Borngreat Accounting, a product of Soluotech, you agree to be bound by these Terms of Service. This platform is designed as a personal accounting tool for individual financial monitoring.
                        </p>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">2. User Responsibilities</h2>
                        <p>
                            Users are responsible for the accuracy of the data they manually enter into the system. While we provide the tools for analysis, the results are dependent on user input. You must maintain the security of your account credentials.
                        </p>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">3. Subscription & Pro Tier</h2>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>The core platform is 'Free Forever'.</li>
                            <li>The 'Pro Tier' ($10) is a voluntary one-time payment for 'Feature Request Priority'.</li>
                            <li>Payments for Pro Tier are processed via 'Contact Sales' and are non-refundable once the priority request has been logged.</li>
                        </ul>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">4. Limitation of Liability</h2>
                        <p>
                            Borngreat Accounting is a tracking and management tool, not a financial advisory service. We are not liable for any financial decisions made based on the data displayed in the application.
                        </p>
                    </motion.section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
