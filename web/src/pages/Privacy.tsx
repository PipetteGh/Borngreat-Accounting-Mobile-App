import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Lock } from 'lucide-react';

export default function Privacy() {
    useEffect(() => {
        document.title = 'Privacy Policy | Borngreat Accounting - Data Protection & Security';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Read the Borngreat Accounting Privacy Policy. Learn about our zero-trust architecture, bank-grade encryption, and uncompromising commitment to your financial data security.');
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
                        <Lock className="w-4 h-4" /> DATA PROTECTION
                    </motion.div>
                    <motion.h1 
                        {...fadeIn}
                        className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1] text-primary"
                    >
                        Privacy Policy.
                    </motion.h1>
                    <motion.p {...fadeIn} className="text-secondary mt-4 font-normal text-sm uppercase tracking-[0.1em]">
                        Last Updated: April 12, 2026
                    </motion.p>
                </header>

                <div className="space-y-16 text-secondary leading-relaxed font-normal">
                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">1. Our Commitment</h2>
                        <p>
                            At Borngreat Accounting, we understand that your financial data is deeply personal. Founded and engineered by a Cybersecurity infrastructure specialist, our platform is built on the principle of <strong>Zero-Trust Architecture</strong>. We do not sell your data, we do not share it with third-party advertisers, and we do not use it for any purpose other than providing you with financial clarity.
                        </p>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">2. Data Collection</h2>
                        <p>
                            We collect only the information necessary to provide the service:
                        </p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>Account Information: Name and email address for authentication.</li>
                            <li>Financial Records: Income, expenditure, and budget data that you manually input.</li>
                            <li>Technical Logs: IP addresses and browser types for security monitoring and audit trails.</li>
                        </ul>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">3. Data Security</h2>
                        <p>
                            Your data is stored using bank-grade encryption. As an ISO/IEC 27001 compliant operation, we implement strict access controls and regular security audits. All financial entries are isolated per user and encrypted at rest.
                        </p>
                    </motion.section>

                    <motion.section {...fadeIn} className="space-y-6 text-sm opacity-60">
                        <p>
                            For further inquiries regarding your data rights or to request data deletion, please contact us at info@soluotech.com.
                        </p>
                    </motion.section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
