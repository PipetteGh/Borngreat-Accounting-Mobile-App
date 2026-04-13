import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PublicNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuthStore();
    const [companyOpen, setCompanyOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeHash, setActiveHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setActiveHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                const navHeight = 64;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                window.history.pushState(null, '', `/#${id}`);
                setActiveHash(`#${id}`);
                setIsMobileMenuOpen(false);
            }
        }
    };

    const isActive = (path: string, hash?: string) => {
        if (hash) {
            return location.pathname === '/' && activeHash === hash;
        }
        return location.pathname === path;
    };

    const linkClasses = (path: string, hash?: string) => cn(
        "relative transition-all duration-300 hover:text-primary py-1",
        isActive(path, hash) 
            ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full" 
            : "text-secondary/70 font-semibold"
    );

    return (
        <>
        <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl font-outfit">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 z-[60]">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-base shadow-sm">B</div>
                    <span className="font-black text-xl tracking-tighter text-primary">Borngreat</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-10 text-sm">
                    <div 
                        className="relative"
                        onMouseEnter={() => setCompanyOpen(true)}
                        onMouseLeave={() => setCompanyOpen(false)}
                    >
                        <button className={cn(
                            "flex items-center gap-1 transition-colors py-1",
                            (isActive('/about') || isActive('/contact')) ? "text-primary font-bold" : "text-secondary/70 font-semibold hover:text-primary"
                        )}>
                            Company <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", companyOpen ? 'rotate-180' : '')} />
                        </button>
                        {companyOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                                <div className="bg-white rounded-xl shadow-xl border border-border/50 py-2 min-w-[170px]">
                                    <Link to="/about" className={cn("block px-5 py-2.5", isActive('/about') ? "text-primary bg-surface font-bold" : "text-secondary/70 hover:bg-surface")}>About Us</Link>
                                    <Link to="/contact" className={cn("block px-5 py-2.5", isActive('/contact') ? "text-primary bg-surface font-bold" : "text-secondary/70 hover:bg-surface")}>Contact Us</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/#problem" onClick={(e) => scrollToSection(e, 'problem')} className={linkClasses('/', '#problem')}>Challenge</Link>
                    <Link to="/#showcase" onClick={(e) => scrollToSection(e, 'showcase')} className={linkClasses('/', '#showcase')}>Features</Link>
                    <Link to="/#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className={linkClasses('/', '#pricing')}>Pricing</Link>
                </div>

                {/* Desktop Auth */}
                <div className="hidden md:flex gap-4">
                    {token ? (
                        <Button 
                            onClick={() => navigate('/dashboard')} 
                            className="bg-primary text-white px-7 rounded-xl h-11 text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-primary/10 gap-2"
                        >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button 
                                onClick={() => navigate('/login')} 
                                className="bg-accentPurple text-white px-7 rounded-xl h-11 text-sm font-bold hover:scale-105 transition-all hover:text-white"
                            >
                                Sign In
                            </Button>
                            <Button 
                                onClick={() => navigate('/register')} 
                                className="bg-primary text-white px-7 rounded-xl h-11 text-sm font-bold hover:scale-105 transition-all"
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Controls — Only Hamburger here */}
                <div className="flex items-center gap-3 md:hidden z-[60]">
                    {!token && (
                        <Button 
                            onClick={() => navigate('/register')} 
                            className="bg-primary text-white px-4 rounded-lg h-9 text-[10px] font-black uppercase tracking-widest shadow-md"
                        >
                            Get Started
                        </Button>
                    )}
                    <button 
                        className="p-1 text-primary"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

            </div>

        </nav>
        
        {/* Mobile Menu Panel — Moved OUTSIDE nav to escape backdrop-blur constraints */}
        <div 
            className={cn(
                "fixed inset-0 z-[9999] md:hidden flex flex-col p-8 pt-24 transition-all duration-300 ease-in-out shadow-2xl overflow-y-auto",
                isMobileMenuOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"
            )}
            style={{ backgroundColor: '#FFFFFF' }}
        >
            {/* Close Button — Inside drawer to ensure visibility */}
            <button 
                className="absolute top-4 right-6 p-2 text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <X className="w-7 h-7" />
            </button>

            <div className="flex flex-col gap-8 text-xl">
                <Link to="/about" className="font-extrabold text-[#1B1B2F] tracking-tight">About Us</Link>
                <Link to="/contact" className="font-extrabold text-[#1B1B2F] tracking-tight">Contact Us</Link>
                <Link to="/#problem" onClick={(e) => scrollToSection(e, 'problem')} className="font-extrabold text-[#1B1B2F] tracking-tight">Challenge</Link>
                <Link to="/#showcase" onClick={(e) => scrollToSection(e, 'showcase')} className="font-extrabold text-[#1B1B2F] tracking-tight">Features</Link>
                <Link to="/#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="font-extrabold text-[#1B1B2F] tracking-tight">Pricing</Link>
            </div>

            <div className="mt-auto flex flex-col gap-4 pb-12">
                {token ? (
                    <Button onClick={() => navigate('/dashboard')} className="w-full h-14 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Dashboard</Button>
                ) : (
                    <>
                        <Button onClick={() => navigate('/login')} className="w-full h-14 bg-accentPurple text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Sign In</Button>
                        <Button onClick={() => navigate('/register')} className="w-full h-14 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Get Started</Button>
                    </>
                )}
            </div>
        </div>
        </>
    );
};
