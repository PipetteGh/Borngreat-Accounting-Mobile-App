import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 font-outfit relative">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 text-[#8E92A8] hover:text-primary gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:translate-x-[-2px] z-50 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:scale-110" /> Back to Home
      </Button>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-accentPurple/5 blur-[80px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accentCyan/5 blur-[80px]" />
      </div>
      <div className="w-full max-w-[420px] z-10">
        <div className="bg-white/40 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[40px] p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
