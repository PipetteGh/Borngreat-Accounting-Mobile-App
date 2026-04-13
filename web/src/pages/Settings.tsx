import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, DollarSign, Shield, LogOut, 
  ChevronRight, Save, UserCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currencySymbol, setCurrencySymbol] = useState(user?.currency_symbol || '$');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Settings | Borngreat Accounting';
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !currencySymbol) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', { 
        full_name: fullName, 
        currency_symbol: currencySymbol 
      });
      await updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary">Settings</h2>
        <p className="text-secondary">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav (Desktop) */}
        <div className="space-y-2">
           <Button variant="secondary" className="w-full justify-start gap-3 rounded-xl py-6 font-bold text-accentPurple bg-surface border border-accentPurple/20">
              <UserCircle className="w-5 h-5" /> Profile Settings
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl py-6 font-bold text-secondary hover:text-primary transition-colors">
              <Shield className="w-5 h-5" /> Security
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl py-6 font-bold text-secondary hover:text-primary transition-colors">
              <LogOut className="w-5 h-5" /> Account Data
           </Button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-[2rem] border-border shadow-sm bg-surface overflow-hidden">
            <CardHeader className="bg-background/30 pb-12 pt-8 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2.5rem] bg-accentPurple flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-accentPurple/20 transform transition-transform group-hover:scale-105">
                   {getInitials(user?.full_name || 'U')}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-background border border-border p-2 rounded-xl shadow-lg cursor-pointer hover:bg-surface transition-colors">
                   <User className="w-4 h-4 text-primary" />
                </div>
              </div>
              <CardTitle className="mt-6 text-2xl font-bold">{user?.full_name}</CardTitle>
              <CardDescription>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <Input 
                          className="pl-12 py-6 rounded-2xl bg-background border-border focus-visible:ring-accentPurple transition-all"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">Email Address</Label>
                      <div className="relative opacity-60">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <Input 
                          readOnly
                          className="pl-12 py-6 rounded-2xl bg-background border-border cursor-not-allowed"
                          value={user?.email || ''}
                        />
                      </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">Currency Symbol</Label>
                    <div className="relative max-w-[200px]">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <Input 
                        className="pl-12 py-6 rounded-2xl bg-background border-border focus-visible:ring-accentPurple transition-all"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <p className="text-[10px] text-secondary pl-1">This symbol will be used across all financial displays.</p>
                 </div>

                 <div className="pt-4 flex justify-end shrink-0">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-accentPurple px-8 py-6 h-auto rounded-2xl gap-2 font-bold shadow-lg shadow-accentPurple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                       {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                       Update Profile
                    </Button>
                 </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 gap-4">
             <Card className="rounded-[1.5rem] border-border shadow-sm bg-surface hover:bg-background/20 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accentCyan/10 flex items-center justify-center text-accentCyan">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-bold text-primary">Security Settings</h4>
                         <p className="text-xs text-secondary">Change password and manage 2FA</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary transition-all" />
                </CardContent>
             </Card>

             <Card 
               onClick={() => logout()}
               className="rounded-[1.5rem] border-border shadow-sm bg-surface hover:bg-destructive/5 transition-colors cursor-pointer group"
             >
                <CardContent className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-bold text-primary">Logout</h4>
                         <p className="text-xs text-secondary">Securely sign out of your account</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-secondary group-hover:text-destructive transition-all" />
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
