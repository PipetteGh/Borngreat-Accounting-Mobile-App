import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | Borngreat Accounting - Personal Financial Intelligence';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Sign in to your Borngreat Accounting dashboard. Track income, manage expenditure, and monitor budgets with precision financial tools.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "h-12 rounded-xl border-[#EAECEF] bg-white text-[#1B1B2F] px-4 text-sm focus:ring-accentPurple transition-all font-outfit font-bold";

  return (
    <Card className="border-none shadow-none bg-transparent mx-auto relative font-outfit">
      <div className="flex flex-col items-center mb-6">
         <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 overflow-hidden border border-[#EAECEF]">
            <img src="/logo.png" alt="Borngreat Accounting Logo" className="w-full h-full object-contain p-2" />
         </div>
         <h1 className="text-2xl font-black text-[#1B1B2F] mb-1 tracking-tighter uppercase font-outfit">Login</h1>
         <p className="text-[#8E92A8] text-[10px] font-black uppercase tracking-[0.2em] opacity-60 font-outfit">Borngreat Accounting</p>
      </div>

      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4 px-0 py-0">
          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-[11px] font-bold text-center font-outfit">{error}</div>}
          
          <div className="space-y-0">
            <Input 
              id="email" 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="space-y-0">
            <Input 
              id="password" 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-0 pb-0 pt-4">
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-xl bg-accentPurple hover:bg-accentPurple/90 text-white font-black text-sm transition-all shadow-lg shadow-accentPurple/20 font-outfit"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Login'}
          </Button>
          <div className="text-center text-base font-medium text-[#8E92A8] font-outfit">
            Don't have an account?{' '}
            <Link to="/register" className="text-accentPurple font-black hover:underline ml-1">
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
