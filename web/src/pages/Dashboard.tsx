import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { 
  FileText, Target, ShieldCheck, Activity,
  Send, Receipt, Landmark, PieChart as PieIcon,
  Search, Settings, Wallet, TrendingUp, Plus,
  ArrowUpCircle, ArrowDownCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#7c5dfa', '#26c986', '#ff914d', '#00c8e2', '#ffb020', '#e74c6f', '#8B5CF6', '#06b6d4'];

export default function Dashboard() {
  const { user, setUnreadCount } = useAuthStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Dashboard | Borngreat Accounting';
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [summaryRes, trendRes, expBreakdownRes, incBreakdownRes, budgetsRes] = await Promise.all([
        api.get(`/dashboard/summary?period=${period}`),
        api.get(`/dashboard/trend?period=${period}`),
        api.get(`/dashboard/category-breakdown?period=${period}&type=expense`),
        api.get(`/dashboard/category-breakdown?period=${period}&type=income`).catch(() => ({ data: { breakdown: [] } })),
        api.get(`/budgets?month_year=${new Date().toISOString().substring(0, 7)}`)
      ]);

      setSummary(summaryRes.data);
      setUnreadCount(summaryRes.data?.unread_notifications || 0);
      setTrend(trendRes.data.trend || []);
      setExpenseBreakdown(expBreakdownRes.data.breakdown || []);
      setIncomeBreakdown(incBreakdownRes.data.breakdown || []);
      setBudgets(budgetsRes.data.budgets || []);
    } catch (error) {
      toast.error('Failed to sync dashboard data');
    }
  }, [period, user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const currency = user?.currency_symbol || '$';
  
  const expense = parseFloat(summary?.total_expense) || 0;
  const income = parseFloat(summary?.total_income) || 0;
  const balance = parseFloat(summary?.balance) || 0;
  const savingsRate = income > 0 ? ((balance / income) * 100) : 0;
  const avgDailyExpense = (expense / (trend.length || 1));

  const totalBudgetTarget = budgets.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
  const totalBudgetConsumed = budgets.reduce((acc, b) => acc + parseFloat(b.actual_spend || 0), 0);
  const budgetUtilization = totalBudgetTarget > 0 ? (totalBudgetConsumed / totalBudgetTarget) * 100 : 0;
  
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let runningBalance = 0;
  const balanceTrendData = trend.map(item => {
    runningBalance += (item.income - item.expense);
    return {
      date: new Date(item.date).toLocaleDateString([], { day: 'numeric', month: 'short' }),
      balance: Math.max(runningBalance, 0)
    };
  });

  const formattedTrend = trend.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString([], { day: 'numeric', month: 'short' })
  }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 font-outfit">
      {/* Welcome & Period Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div id="welcome-message">
          <h2 className="text-xl font-black tracking-tight text-primary">
            Welcome, <span className="text-accentPurple">{user?.full_name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-[#8E92A8] text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden sm:flex bg-button-background p-1 rounded-lg border border-border/50">
              {['Weekly', 'Monthly', 'Quarter', 'Yearly'].map((t) => (
                <button 
                  key={t}
                  className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                    t === 'Monthly' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
           </div>
          <Button variant="outline" className="h-8 rounded-lg border-border/50 font-black text-[9px] uppercase tracking-widest bg-white shadow-sm hover:bg-slate-50 gap-2 px-3">
            <Settings className="w-3.5 h-3.5 text-secondary" /> Settings
          </Button>
        </div>
      </div>

      {/* 1. Main Stats Bento Grid - Sharp Executive Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Total Balance Card (Sharp White) */}
        <Card id="net-flow-card" className="lg:col-span-2 rounded-xl bg-white border border-border/50 text-primary overflow-hidden relative group shadow-sm h-full">
           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
           <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-secondary/60 uppercase tracking-[0.2em]">Total Balance</p>
                    <h3 className="text-xl font-black tabular-nums text-primary tracking-tighter mt-0.5">
                      {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[6px] font-black text-secondary/40 uppercase tracking-widest mt-0.5">
                      as at {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/5 rounded-lg p-2 border border-border/20 text-center">
                    <p className="text-[6px] font-black text-secondary/40 uppercase tracking-widest mb-0.5">Efficiency</p>
                    <div className="flex items-center justify-center gap-1">
                       <TrendingUp className="w-2.5 h-2.5 text-accentGreen" />
                       <span className="font-black text-[9px] text-primary">+{savingsRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="bg-secondary/5 rounded-lg p-2 border border-border/20 text-center">
                    <p className="text-[6px] font-black text-secondary/40 uppercase tracking-widest mb-0.5">Activity</p>
                    <span className="font-black text-[9px] text-primary/80">{summary?.transaction_count || 0} Trx</span>
                  </div>
                </div>
              </div>

              <div className="h-[25px] w-full opacity-40">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceTrendData.slice(-10)}>
                       <Area type="monotone" dataKey="balance" stroke="#7c5dfa" fill="#7c5dfa33" strokeWidth={2} dot={false} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>

        {/* Quick Actions (2x2 Grid) */}
        <Card className="lg:col-span-2 rounded-xl border-border bg-slate-50 shadow-sm overflow-hidden flex flex-col h-full">
           <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[8px] font-black uppercase tracking-widest text-secondary/60">Quick Actions</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0 grid grid-cols-2 gap-2 flex-1">
              {[
                { icon: <Plus className="w-3.5 h-3.5" />, label: 'Inflow', color: 'bg-white text-accentGreen', path: '/income' },
                { icon: <ArrowUpCircle className="w-3.5 h-3.5" />, label: 'Expense', color: 'bg-white text-accentOrange', path: '/expenditure' },
                { icon: <Landmark className="w-3.5 h-3.5" />, label: 'Transfers', color: 'bg-white text-accentCyan', path: '/accounts' },
                { icon: <PieIcon className="w-3.5 h-3.5" />, label: 'Budgets', color: 'bg-white text-accentPurple', path: '/budgets' }
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-border/50 hover:bg-slate-50 transition-all group shadow-sm active:scale-95"
                >
                  <div className={`w-7 h-7 rounded-lg ${action.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-border/20`}>
                    {action.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate">{action.label}</span>
                </button>
              ))}
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="rounded-xl border-border bg-white hover:translate-y-[-1px] transition-all cursor-pointer shadow-sm p-4">
           <CardContent className="p-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-accentGreen/10 flex items-center justify-center text-accentGreen shadow-inner">
                    <ArrowDownCircle className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[8px] font-black text-secondary/60 uppercase tracking-widest mb-0.5">Total Income</p>
                   <h4 className="text-xl font-black text-primary tracking-tighter">
                      {currency}{income.toLocaleString()}
                   </h4>
                 </div>
              </div>
              <div className="bg-accentGreen/5 px-2.5 py-1.5 rounded-lg border border-accentGreen/10 flex items-center gap-1.5">
                 <Activity className="w-3 h-3 text-accentGreen" />
                 <span className="text-[8px] font-black text-accentGreen">Daily: {currency}{(income / (trend.length || 1)).toFixed(0)}</span>
              </div>
           </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-white hover:translate-y-[-1px] transition-all cursor-pointer shadow-sm p-4">
           <CardContent className="p-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-accentOrange/10 flex items-center justify-center text-accentOrange shadow-inner">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                 <div>
                   <p className="text-[8px] font-black text-secondary/60 uppercase tracking-widest mb-0.5">Total Spent</p>
                   <h4 className="text-xl font-black text-primary tracking-tighter">
                      {currency}{expense.toLocaleString()}
                   </h4>
                 </div>
              </div>
              <div className="bg-accentOrange/5 px-2.5 py-1.5 rounded-lg border border-accentOrange/10 flex items-center gap-1.5">
                 <Target className="w-3 h-3 text-accentOrange" />
                 <span className="text-[8px] font-black text-accentOrange">Daily: {currency}{avgDailyExpense.toFixed(0)}</span>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* 2. All Wallets - Horizontal Scrollable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h4 className="text-base font-black tracking-tight uppercase">Accounts</h4>
           <Button variant="ghost" size="sm" className="gap-1 font-bold text-accentPurple text-[10px] uppercase" onClick={() => navigate('/accounts')}>
              View All <ChevronRight className="w-3.5 h-3.5" />
           </Button>
        </div>
        <div id="accounts-carousel" className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 snap-x">
          {summary?.account_balances?.map((acc: any) => (
             <Card key={acc.id} className="min-w-[140px] md:min-w-[170px] rounded-xl border-border bg-surface p-3 shadow-sm hover:translate-y-[-1px] transition-transform snap-center">
                <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center text-accentPurple mb-2 shadow-sm border border-border/10">
                   <div className="scale-75">{acc.type === 'Bank' ? <ShieldCheck className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}</div>
                </div>
                <p className="text-[9px] font-black text-secondary uppercase tracking-[0.05em] mb-0.5 line-clamp-1">{acc.name}</p>
                <h5 className="font-black text-sm text-primary">{currency}{parseFloat(acc.current_balance).toLocaleString()}</h5>
             </Card>
          ))}
        </div>
      </div>

      

      {/* 5. Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card id="trajectory-chart" className="lg:col-span-2 rounded-3xl border-border shadow-sm bg-surface overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-0 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-black">Trajectory</CardTitle>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accentPurple">
                    <div className="w-2.5 h-2.5 rounded-full bg-accentPurple"></div> Income
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                    <div className="w-2.5 h-2.5 rounded-full bg-accentOrange"></div> Spent
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 h-[280px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrend}>
                     <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#7c5dfa" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#7c5dfa" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ff914d" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#ff914d" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#8E92A8'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#8E92A8'}} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} />
                     <Area type="monotone" dataKey="income" stroke="#7c5dfa" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                     <Area type="monotone" dataKey="expense" stroke="#ff914d" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="rounded-3xl border-border shadow-sm bg-surface overflow-hidden flex flex-col">
            <CardHeader className="p-6 md:p-8 pb-2">
               <CardTitle className="text-lg font-black">Growth</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-4 flex-1 h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceTrendData}>
                     <Line type="monotone" dataKey="balance" stroke="#26c986" strokeWidth={4} dot={false} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </LineChart>
               </ResponsiveContainer>
               <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-secondary">
                     <span>Efficiency</span>
                     <span className="text-accentGreen">+{savingsRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                     <div className="bg-accentGreen h-full transition-all duration-1000" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                   </div>
                </div>
             </CardContent>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
           <Card className="rounded-3xl border-border shadow-sm bg-surface">
              <CardHeader className="p-6 md:p-8">
                 <CardTitle className="text-lg font-black tracking-tight">Expenditure Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-full md:w-1/2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={expenseBreakdown} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="category_total">
                             {expenseBreakdown.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-full md:w-1/2 space-y-2.5">
                    {expenseBreakdown.slice(0, 4).map((item, index) => (
                       <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                             <span className="font-bold text-primary">{item.category_name}</span>
                          </div>
                          <span className="font-black text-secondary">{item.percentage}%</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-3xl border-border shadow-sm bg-surface">
              <CardHeader className="p-6 md:p-8">
                 <CardTitle className="text-lg font-black tracking-tight">Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-full md:w-1/2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={incomeBreakdown} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="category_total">
                             {incomeBreakdown.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-full md:w-1/2 space-y-2.5">
                    {incomeBreakdown.slice(0, 4).map((item, index) => (
                       <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                             <span className="font-bold text-primary">{item.category_name}</span>
                          </div>
                          <span className="font-black text-secondary">{item.percentage}%</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           
       </div>
       {/* Enhanced Budget Tracker from Image */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-8 rounded-[32px] border-border bg-surface shadow-sm overflow-hidden">
             <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-lg font-black tracking-tight">Active Budget Performance</CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Dynamic tracking for ongoing limits</CardDescription>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-primary">{currency}{totalBudgetConsumed.toLocaleString()} / {currency}{totalBudgetTarget.toLocaleString()}</p>
                </div>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-6">
                {budgets.length > 0 ? budgets.slice(0, 3).map((b, i) => {
                   const used = parseFloat(b.actual_spend || 0);
                   const target = parseFloat(b.amount || 0);
                   const perc = target > 0 ? (used / target) * 100 : 0;
                   return (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-black uppercase text-primary tracking-widest">{b.category_name}</span>
                            <span className={`text-[11px] font-black ${perc > 100 ? 'text-destructive' : 'text-accentPurple'}`}>{perc.toFixed(0)}%</span>
                         </div>
                         <div className="h-2 w-full bg-secondary/5 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min(perc, 100)}%` }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               className={`h-full rounded-full ${perc > 90 ? 'bg-destructive' : i % 2 === 0 ? 'bg-accentPurple' : 'bg-accentCyan'}`}
                            />
                         </div>
                      </div>
                   );
                }) : (
                   <p className="py-10 text-center text-[10px] font-black uppercase text-secondary/40 tracking-widest">No active budgets found for this cycle</p>
                )}
             </CardContent>
          </Card>

          <Card className="lg:col-span-4 rounded-[32px] border-border bg-surface shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
             <CardHeader className="p-8">
                <CardTitle className="text-lg font-black tracking-tight">Focus Score</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 flex-1 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                   <svg className="w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary/5" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * Math.min(savingsRate, 100)) / 100} className="text-accentPurple transition-all duration-1000" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-primary">{savingsRate.toFixed(0)}</span>
                      <span className="text-[8px] font-black uppercase text-secondary/40 tracking-widest">Stability</span>
                   </div>
                </div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] opacity-80 leading-relaxed px-4">
                   Your financial footprint is {savingsRate > 20 ? 'Solid' : 'Critical'}. Keep expenditures below target.
                </p>
             </CardContent>
          </Card>
      </div>

      {/* 4. Quick Links Grid */}
      <div className="grid grid-cols-2 gap-4">
          <Card onClick={() => navigate('/budgets')} className="p-6 rounded-2xl bg-accentPurple/5 border-border flex flex-col justify-between group hover:bg-accentPurple/10 cursor-pointer transition-all">
             <div className="w-10 h-10 rounded-xl bg-accentPurple text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
               <Target className="w-5 h-5" />
             </div>
             <div>
                <h5 className="font-black text-sm text-primary">Budget Flow</h5>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-tight">Financial Control</p>
             </div>
          </Card>
          <Card onClick={() => navigate('/reports')} className="p-6 rounded-2xl bg-accentCyan/5 border-border flex flex-col justify-between group hover:bg-accentCyan/10 cursor-pointer transition-all">
             <div className="w-10 h-10 rounded-xl bg-accentCyan text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
               <FileText className="w-5 h-5" />
             </div>
             <div>
                <h5 className="font-black text-sm text-primary">Quick Stats</h5>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-tight">Analysis Records</p>
             </div>
          </Card>
      </div>
    </div>
  );
}
