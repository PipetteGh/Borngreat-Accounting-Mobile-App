import { Link } from 'react-router-dom';
import { Smartphone, Mail, Shield, Globe } from 'lucide-react';

export const PublicFooter = () => {
    return (
        <footer className="py-16 md:py-24 border-t border-border/50 bg-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Brand Identity */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg">B</div>
                            <span className="font-black text-xl tracking-tighter text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>Borngreat</span>
                        </Link>
                        <p className="text-secondary text-[12px] leading-relaxed font-medium opacity-70 max-w-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Personal financial intelligence for the high-growth professional. Auditing your growth, one transaction at a time.
                        </p>
                        <div className="space-y-2">
                           <p className="text-secondary text-[9px] font-bold tracking-[0.2em] opacity-40" style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' }}>
                              A Soluotech Solution
                           </p>
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div className="space-y-6">
                        <h4 className="text-[12px] font-black tracking-wide text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>Platform</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Income Tracking', to: '/income' },
                                { label: 'Expenditure Audit', to: '/expenditure' },
                                { label: 'Asset Management', to: '/accounts' },
                                { label: 'Budget Oversight', to: '/budgets' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.to} className="text-secondary text-[12px] font-medium hover:text-accentPurple transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-6">
                        <h4 className="text-[12px] font-black tracking-wide text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>Company</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'About Us', to: '/about' },
                                { label: 'Support Center', to: '/help' },
                                { label: 'Contact Us', to: '/contact' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.to} className="text-secondary text-[12px] font-medium hover:text-accentPurple transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Compliance & Mobile */}
                    <div className="space-y-6">
                        <h4 className="text-[12px] font-black tracking-wide text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>Compliance</h4>
                        <ul className="space-y-4 mb-8">
                            {[
                                { label: 'Privacy Protocol', to: '/privacy', icon: Shield },
                                { label: 'Service Terms', to: '/terms', icon: Globe }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.to} className="flex items-center gap-2 text-secondary text-[12px] font-medium hover:text-accentPurple transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        <item.icon className="w-3.5 h-3.5 opacity-40" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4 border-t border-border/30">
                           <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-primary text-white text-[11px] font-bold tracking-wide hover:bg-primary/95 transition-all shadow-xl shadow-primary/10 group active:scale-[0.98]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                               <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                               Download Android App
                           </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-secondary text-[10px] font-medium opacity-40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        © 2026 Borngreat Accounting. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="mailto:support@soluotech.com" className="flex items-center gap-2 text-secondary text-[10px] font-medium hover:text-primary transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                           <Mail className="w-3.5 h-3.5" /> support@soluotech.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
