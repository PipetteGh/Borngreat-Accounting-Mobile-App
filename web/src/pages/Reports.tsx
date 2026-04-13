import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Calendar, Download, 
  PieChart as PieIcon,
  ArrowRight, Search,
  ArrowDownCircle, ArrowUpCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const currency = user?.currency_symbol || '$';

  const fetchReport = useCallback(async (isCustom = false) => {
    setLoading(true);
    try {
      const p = isCustom ? 'custom' : period;
      const params: any = { period: p };
      if (isCustom) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const [summaryRes, expBreakdownRes, incBreakdownRes, trendRes] = await Promise.all([
        api.get(`/dashboard/summary`, { params }),
        api.get(`/dashboard/category-breakdown`, { params: { ...params, type: 'expense' } }),
        api.get(`/dashboard/category-breakdown`, { params: { ...params, type: 'income' } }),
        api.get(`/dashboard/trend`, { params })
      ]);

      setReportData({
        summary: summaryRes.data,
        expenseBreakdown: expBreakdownRes.data.breakdown || [],
        incomeBreakdown: incBreakdownRes.data.breakdown || [],
        trend: trendRes.data.trend || []
      });
      toast.success('Report generated');
    } catch (error) {
      toast.error('Failed to sync reports');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    document.title = 'Reports | Borngreat Accounting';
    fetchReport();
  }, [fetchReport]);

  const handlePrint = async () => {
    if (!reportData) return;
    
    // Exact Mobile PDF HTML Template Implementation
    const s = reportData.summary;
    const totalIncome = parseFloat(s.total_income) || 0;
    const totalExpense = parseFloat(s.total_expense) || 0;
    const balance = parseFloat(s.balance) || 0;
    // Removed unused analytic projections

    const startLabel = new Date(reportData.summary.period_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const endLabel = new Date(reportData.summary.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let allTransactions: any[] = [];
    try {
      const txRes = await api.get(`/transactions?start_date=${reportData.summary.period_start}&end_date=${reportData.summary.period_end}&limit=10000`);
      allTransactions = txRes.data.transactions || [];
    } catch (e) { console.error(e); }

    // Removed filtered transaction lists for print mapping

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body { font-family: 'Outfit', Arial, sans-serif; padding: 40px; color: #1B1B2F; }
        h1 { color: #7c5dfa; border-bottom: 2px solid #7c5dfa; padding-bottom: 8px; }
        .card { background: #F4F6FA; padding: 15px; border-radius: 12px; flex: 1; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background: #7c5dfa; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #EAECEF; }
        .green { color: #26c986; } .orange { color: #ff914d; }
    </style></head><body>
        <h1>Borngreat Financial Report</h1>
        <p>Period: ${startLabel} - ${endLabel}</p>
        <div style="display:flex;gap:10px;">
          <div class="card">Income: ${currency}${totalIncome.toLocaleString()}</div>
          <div class="card">Expense: ${currency}${totalExpense.toLocaleString()}</div>
          <div class="card">Net: ${currency}${balance.toLocaleString()}</div>
        </div>
        <h2>Transaction Log</h2>
        <table><tr><th>Date</th><th>Cat</th><th>Desc</th><th>Amount</th></tr>
        ${allTransactions.map(t => `<tr><td>${new Date(t.transaction_date).toLocaleDateString()}</td><td>${t.category_name}</td><td>${t.description}</td><td class="${t.type === 'income' ? 'green' : 'orange'}">${t.type === 'income' ? '+' : '-'}${currency}${parseFloat(t.amount).toLocaleString()}</td></tr>`).join('')}
        </table>
    </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); printWin.close(); }, 500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl h-9 w-9">
               <ArrowLeft className="w-5 h-5 text-secondary" />
            </Button>
            <div>
               <h2 className="text-xl font-black">Financial Reports</h2>
               <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-60">Mobile Parity Analytics</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Export started')} className="rounded-xl h-10 px-4 gap-1.5 font-bold text-xs">
            <Search className="w-3.5 h-3.5" /> CSV Export
          </Button>
          <Button 
            size="sm"
            className="bg-accentPurple text-white rounded-xl h-10 px-4 gap-1.5 font-bold text-xs shadow-lg shadow-accentPurple/20"
            onClick={handlePrint}
          >
            <Download className="w-3.5 h-3.5" /> Print Analysis
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
         {['weekly', 'monthly', 'quarterly', 'yearly'].map((p) => (
            <button
               key={p}
               onClick={() => setPeriod(p)}
               className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-accentPurple text-white' : 'bg-surface border border-border text-secondary'
               }`}
            >
               {p}
            </button>
         ))}
      </div>

      <Card className="rounded-[2rem] border-border bg-surface overflow-hidden shadow-sm">
        <CardContent className="p-6 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1">Begin Date</label>
                <div className="relative">
                   <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accentPurple opacity-40" />
                   <input type="date" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border font-bold text-xs" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1">End Date</label>
                <div className="relative">
                   <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accentOrange opacity-40" />
                   <input type="date" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border font-bold text-xs" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <Button onClick={() => fetchReport(true)} disabled={loading} className="bg-primary text-white h-[44px] rounded-xl font-black text-xs gap-1.5">
                {loading ? "Syncing..." : "Generate Analysis"} <ArrowRight className="w-4 h-4" />
              </Button>
           </div>
        </CardContent>
      </Card>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Card className="rounded-[2rem] border-border bg-surface">
              <CardHeader className="p-6 pb-2">
                 <CardTitle className="text-base font-black tracking-tight">Financial Health</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="p-4 rounded-2xl bg-accentGreen/5 border border-accentGreen/10 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-secondary uppercase mb-0.5 tracking-widest">Inflow</p>
                       <h4 className="text-xl font-black text-accentGreen">{currency}{parseFloat(reportData.summary.total_income).toLocaleString()}</h4>
                    </div>
                    <ArrowDownCircle className="w-6 h-6 text-accentGreen opacity-20" />
                 </div>
                 <div className="p-4 rounded-2xl bg-accentOrange/5 border border-accentOrange/10 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-secondary uppercase mb-0.5 tracking-widest">Outflow</p>
                       <h4 className="text-xl font-black text-accentOrange">{currency}{parseFloat(reportData.summary.total_expense).toLocaleString()}</h4>
                    </div>
                    <ArrowUpCircle className="w-6 h-6 text-accentOrange opacity-20" />
                 </div>
                 <div className="p-4 rounded-2xl bg-accentPurple/5 border border-accentPurple/10 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-secondary uppercase mb-0.5 tracking-widest">Net</p>
                       <h4 className="text-xl font-black text-accentPurple">{currency}{parseFloat(reportData.summary.balance).toLocaleString()}</h4>
                    </div>
                    <PieIcon className="w-6 h-6 text-accentPurple opacity-20" />
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[2rem] border-border bg-surface md:col-span-2 overflow-hidden flex flex-col">
              <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-black">Velocity</CardTitle>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-accentGreen"></div> In</div>
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-accentOrange"></div> Out</div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-[220px] p-6 pt-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={reportData.trend}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700}} dy={5} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700}} />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'none', fontSize: '10px' }} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                     <Bar dataKey="income" fill="#26c986" radius={[4, 4, 0, 0]} barSize={10} />
                     <Bar dataKey="expense" fill="#ff914d" radius={[4, 4, 0, 0]} barSize={10} />
                   </BarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <Card className="rounded-[2rem] border-border bg-surface md:col-span-3 overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 border-b border-border/30 bg-background/20">
                <CardTitle className="text-lg font-black tracking-tight">Efficiency Ranking</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-background/40">
                       <TableRow className="border-border">
                          <TableHead className="py-4 pl-8 w-12 text-[10px] font-bold uppercase tracking-widest">#</TableHead>
                          <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                          <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest">Impact</TableHead>
                          <TableHead className="py-4 text-center text-[10px] font-bold uppercase tracking-widest">%</TableHead>
                          <TableHead className="py-4 pr-8 text-right text-[10px] font-bold uppercase tracking-widest">Total</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {reportData.expenseBreakdown.map((item: any, i: number) => (
                          <TableRow key={i} className="group border-border hover:bg-accentOrange/5 transition-colors">
                             <TableCell className="py-5 pl-8 font-bold text-secondary/30 text-[10px]">{i+1}</TableCell>
                             <TableCell className="py-5 font-black text-primary uppercase tracking-widest text-[11px]">{item.category_name}</TableCell>
                             <TableCell className="py-5">
                                <div className="w-24 bg-background h-1.5 rounded-full overflow-hidden border border-border/20">
                                   <div className="bg-accentOrange h-full" style={{ width: `${item.percentage}%` }}></div>
                                </div>
                             </TableCell>
                             <TableCell className="py-5 text-center font-black text-accentOrange text-sm">{item.percentage}%</TableCell>
                             <TableCell className="py-5 pr-8 text-right font-black text-lg">
                                {currency}{parseFloat(item.category_total).toLocaleString()}
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
