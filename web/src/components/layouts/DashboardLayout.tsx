import React from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, ArrowUpRight, ArrowDownLeft, FileText, 
  Settings, LogOut, Bell, CreditCard, Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const items = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Income', icon: ArrowUpRight, url: '/income' },
  { title: 'Expenditure', icon: ArrowDownLeft, url: '/expenditure' },
  { title: 'Accounts', icon: CreditCard, url: '/accounts' },
  { title: 'Budgets', icon: Target, url: '/budgets' },
  { title: 'Reports', icon: FileText, url: '/reports' },
  { title: 'Notifications', icon: Bell, url: '/notifications' },
  { title: 'Settings', icon: Settings, url: '/settings' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user, unreadCount } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8f9fc] font-outfit">
        {/* Desktop Sidebar */}
        <Sidebar className="border-r border-border/50 hidden md:flex bg-white shadow-sm">
          <SidebarHeader id="sidebar-brand" className="p-4 flex flex-row items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-base shadow-lg shadow-primary/20">B</div>
            <span className="font-black text-primary text-sm tracking-tighter uppercase">Borngreat</span>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === '/' 
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title} className="mb-0.5">
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        to={item.url} 
                        id={`nav-${item.title.toLowerCase()}`} 
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                          isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="font-black text-[10px] uppercase tracking-wider">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <div className="mt-4 pt-4 border-t border-border/30 px-2 text-center">
                 <p className="text-[7px] font-black text-secondary/30 uppercase tracking-[0.4em] mb-3">Accounts</p>
                 <SidebarMenuItem>
                   <SidebarMenuButton onClick={() => logout()} className="flex items-center gap-2.5 px-3 py-2 text-destructive hover:bg-destructive/5 rounded-lg transition-colors w-full">
                     <LogOut className="w-3.5 h-3.5" />
                     <span className="font-black text-[9px] uppercase tracking-widest">Secure Exit</span>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-x-hidden bg-background">
          {/* Header - Compact ERP Standard */}
          <header className="h-12 md:h-14 border-b border-border/50 bg-white flex items-center justify-between px-4 md:px-5 sticky top-0 z-40 backdrop-blur-md bg-white/95">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <SidebarTrigger className="hover:bg-slate-50 h-8 w-8 text-primary" />
              </div>
              <h1 className="text-sm md:text-base font-black text-primary uppercase tracking-tighter">
                {location.pathname === '/' ? 'Operational Overview' : location.pathname.substring(1).replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="rounded-lg h-8 w-8 relative hover:bg-slate-50 border border-transparent hover:border-border/50">
                 <Bell className="w-4 h-4 text-secondary" />
                 {unreadCount > 0 && (
                   <span className="absolute top-0.5 right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-accentOrange text-[7px] font-black text-white border border-white">
                     {unreadCount > 9 ? '9' : unreadCount}
                   </span>
                 )}
              </Button>
              <div className="flex items-center gap-2 md:gap-3 pl-3 border-l border-border/30">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-primary leading-none mb-0.5 uppercase">{user?.full_name}</p>
                  <p className="text-[7px] font-black text-secondary/60 uppercase tracking-[0.2em]">{user?.currency_symbol || '$'} Prime Entity</p>
                </div>
                <div id="user-profile" className="w-8 h-8 rounded-lg bg-slate-50 border border-border/50 flex items-center justify-center text-primary font-black shadow-sm transform hover:scale-105 transition-transform text-xs">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content - High Density Spacing */}
          <div className="p-3 md:p-4 pb-20 md:pb-6 max-w-[1600px] mx-auto">
            {children}
          </div>

          {/* Mobile Bottom Navigation (1:1 Mobile Parity) - High Density */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 h-14 bg-white shadow-2xl border border-border/50 rounded-2xl flex items-center justify-around px-4 z-50">
             {[
               { icon: LayoutDashboard, url: '/', label: 'Home' },
               { icon: ArrowUpRight, url: '/income', label: 'In' },
               { icon: ArrowDownLeft, url: '/expenditure', label: 'Out' },
               { icon: FileText, url: '/reports', label: 'Reps' },
               { icon: Settings, url: '/settings', label: 'More' }
             ].map((nav) => (
                <Link 
                  key={nav.url} 
                  to={nav.url} 
                  className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
                    location.pathname === nav.url ? 'text-accentPurple scale-105' : 'text-secondary'
                  }`}
                >
                   <nav.icon className="w-5 h-5" />
                   <span className="text-[8px] font-black uppercase tracking-tighter">{nav.label}</span>
                </Link>
             ))}
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}
