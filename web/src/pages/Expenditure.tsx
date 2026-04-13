import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { transactionService } from '@/services/transactionService';
import { accountService } from '@/services/accountService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Search, ArrowUpCircle, 
  Calendar, MoreHorizontal, Trash2, Edit,
  X, Filter, ChevronLeft, ChevronRight, Activity, TrendingDown
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';

const CHART_COLORS = ['#ff914d', '#7c5dfa', '#e74c6f', '#00c8e2', '#ffb020', '#26c986', '#8B5CF6', '#06b6d4'];

export default function Expenditure() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [expenseTransactions, setExpenseTransactions] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('this_month');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    account_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState('');

  const currency = user?.currency_symbol || '$';

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = { 
        type: 'expense',
        period: dateRange,
        limit: 100 
      };
      
      const [txRes, breakdownRes, accRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/dashboard/category-breakdown?period=monthly&type=expense').catch(() => ({ data: { breakdown: [] } })),
        accountService.getAccounts()
      ]);

      setExpenseTransactions(txRes.data.transactions || []);
      setBreakdown(breakdownRes.data.breakdown || []);
      setAccounts(accRes);
    } catch (error) {
      toast.error('Failed to sync expenditure data');
    } finally {
      setLoading(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    fetchData();
    document.title = 'Expenditure and Outflows | Borngreat Accounting';
  }, [fetchData]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTransactions = useMemo(() => {
    return expenseTransactions.filter(tx => {
      const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tx.category_id.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenseTransactions, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      amount: item.amount.toString(),
      description: item.description,
      category_id: item.category_id.toString(),
      account_id: item.account_id.toString(),
      transaction_date: item.transaction_date.split(' ')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this expenditure?')) return;
    try {
      await transactionService.deleteTransaction(id);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: parseInt(formData.category_id),
        account_id: parseInt(formData.account_id),
        transaction_date: formData.transaction_date,
        type: 'expense' as const
      };
      if (editingItem) {
        await transactionService.updateTransaction({ ...payload, id: editingItem.id });
        toast.success('Updated');
      } else {
        await transactionService.createTransaction(payload);
        toast.success('Saved');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error saving');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-outfit">
      {/* Header Bar - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tighter uppercase">Expenditure Overview</h1>
          <p className="text-[#8E92A8] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Prime Financial Outflow Monitoring</p>
        </div>
        <Button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-accentOrange hover:bg-accentOrange/90 text-white rounded-lg h-9 px-5 gap-1.5 font-black text-[9px] uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Expenditure
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Analytics & Quick View */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-xl border-border bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-sm font-black uppercase tracking-widest text-secondary/60">Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="h-[180px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown.length > 0 ? breakdown : [{category_name: 'Empty', category_total: 1}]}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="category_total"
                    >
                      {breakdown.length > 0 ? breakdown.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      )) : <Cell fill="#f0f0f0" />}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {breakdown.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-[11px] font-bold text-primary truncate max-w-[120px]">{item.category_name}</span>
                    </div>
                    <span className="text-[11px] font-black text-secondary/60">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick List - Recent Expenditure */}
          <div className="space-y-2">
             {expenseTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm group hover:border-accentOrange/50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accentOrange/10 flex items-center justify-center text-accentOrange">
                         <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[11px] font-black text-primary leading-tight truncate max-w-[140px]">{tx.description || tx.category_name}</p>
                         <p className="text-[8px] font-black text-secondary/40 uppercase tracking-widest leading-none mt-0.5">Expense</p>
                      </div>
                   </div>
                   <p className="text-xs font-black text-accentOrange">-{currency}{parseFloat(tx.amount).toLocaleString()}</p>
                </div>
             ))}
          </div>
        </div>

        {/* Right Column: Detailed List */}
        <div className="lg:col-span-8">
          <Card className="rounded-xl border-border bg-white shadow-sm min-h-[450px] flex flex-col">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-secondary/60">Expense Statements</CardTitle>
               </div>
               <div className="flex items-center gap-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                     <SelectTrigger className="w-[120px] h-8 rounded-lg bg-slate-50 border-border/50 font-black text-[9px] uppercase tracking-widest">
                        <SelectValue placeholder="Period" />
                     </SelectTrigger>
                     <SelectContent className="bg-white border-border rounded-xl">
                        <SelectItem value="this_month" className="text-[10px] font-black uppercase tracking-widest">This Month</SelectItem>
                        <SelectItem value="last_month" className="text-[10px] font-black uppercase tracking-widest">Last Month</SelectItem>
                        <SelectItem value="all_time" className="text-[10px] font-black uppercase tracking-widest">All Time</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </CardHeader>

            <CardContent className="p-6 pt-4 flex-1">
               {/* Filters Bar - Compact */}
               <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30" />
                     <Input 
                        placeholder="Search narration, category, amount..." 
                        className="h-11 rounded-xl bg-slate-50 border-none font-bold text-xs pl-12 focus-visible:ring-accentOrange"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-2">
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[130px] h-11 rounded-xl bg-slate-50 border-none font-black text-[9px] uppercase tracking-widest text-secondary">
                           <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-border rounded-xl max-h-[200px]">
                           <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Actions</SelectItem>
                           {EXPENSE_CATEGORIES.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()} className="text-[10px] font-black uppercase tracking-widest">{c.name}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Table Header - Aligned with global Table usage */}
               <div className="grid grid-cols-5 px-4 mb-2 text-[9px] font-black text-secondary/40 uppercase tracking-[0.2em]">
                  <div className="col-span-1">Designation</div>
                  <div className="col-span-1">Narration</div>
                  <div className="col-span-1 text-center">Category</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-right">Magnitude</div>
               </div>

               {/* Transactions List */}
               <div className="space-y-0.5">
                  {loading ? (
                     <div className="py-20 flex flex-col items-center justify-center">
                        <Activity className="w-8 h-8 text-accentOrange/20 animate-spin mb-4" />
                        <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[.3em]">Synching Records...</p>
                     </div>
                  ) : paginatedTransactions.length > 0 ? (
                     paginatedTransactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-5 items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors group">
                           <div className="col-span-1">
                              <span className="text-[10px] font-black text-primary/80 truncate block uppercase tracking-tighter">
                                 {new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                           </div>
                           <div className="col-span-1">
                              <p className="text-[11px] font-bold text-primary truncate max-w-[120px]">{tx.description || 'Prime Expense'}</p>
                           </div>
                           <div className="col-span-1 flex justify-center">
                              <span className="text-[9px] font-black text-secondary/60 bg-slate-50 px-2 py-0.5 rounded-lg border border-border/50 uppercase tracking-tighter">
                                 {tx.category_name}
                              </span>
                           </div>
                           <div className="col-span-1 flex justify-center">
                              <span className="text-[8px] font-black text-accentOrange/60 bg-accentOrange/5 px-2 py-0.5 rounded-lg border border-accentOrange/10 uppercase tracking-widest">
                                 Cleared
                              </span>
                           </div>
                           <div className="col-span-1 flex items-center justify-end gap-2">
                              {/* Action Buttons visible on hover */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-md hover:bg-accentOrange/5 text-secondary hover:text-accentOrange"
                                    onClick={() => handleOpenEdit(tx)}
                                 >
                                    <Edit className="w-3 h-3" />
                                 </Button>
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-md hover:bg-destructive/5 text-secondary hover:text-destructive"
                                    onClick={() => handleDelete(tx.id)}
                                 >
                                    <Trash2 className="w-3 h-3" />
                                 </Button>
                              </div>
                              <span className="text-sm font-black text-accentOrange tabular-nums tracking-tighter min-w-[80px] text-right">
                                 -{currency}{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="py-20 text-center space-y-4">
                        <TrendingDown className="w-10 h-10 text-secondary/5 mx-auto" />
                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest">Zero Matching Records</p>
                     </div>
                  )}
               </div>

               {/* Pagination Component - Compact */}
               <div className="mt-auto pt-6 border-t border-border/30 flex items-center justify-between">
                  <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">
                     Statement Fragment {currentPage} of {totalPages || 1}
                  </p>
                  <div className="flex gap-1.5">
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg border-border" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                     >
                        <ChevronLeft className="w-3 h-3" />
                     </Button>
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg border-border" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                     >
                        <ChevronRight className="w-3 h-3" />
                     </Button>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CRUD Modal - Precision Layout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="rounded-xl bg-white border-none max-w-[400px] p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/50">
               <DialogTitle className="text-xl font-black text-primary tracking-tighter uppercase text-center">
                  {editingItem ? 'Edit Entry' : 'New Outflow'}
               </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-widest pl-1">Outflow Magnitude ({currency})</Label>
                        <Input 
                            type="number"
                            step="0.01"
                            autoFocus
                            placeholder="0.00"
                            className="h-11 rounded-xl bg-slate-50 border-border/50 text-lg font-black px-4 focus:ring-accentOrange tracking-tighter"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-widest pl-1">Outflow Classification</Label>
                        <Select onValueChange={(val) => setFormData({...formData, category_id: val})} value={formData.category_id}>
                           <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-border/50 font-bold text-sm">
                              <SelectValue placeholder="Select" />
                           </SelectTrigger>
                           <SelectContent className="z-[300] bg-white border border-border rounded-xl">
                              <div className="p-2 border-b border-border/50 sticky top-0 bg-white">
                                 <Input 
                                    placeholder="Execute search..." 
                                    className="h-8 text-[11px] font-bold"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                 />
                              </div>
                              <div className="overflow-y-auto max-h-[180px]">
                                 {EXPENSE_CATEGORIES.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()} className="font-black uppercase text-[10px] tracking-widest py-3">
                                       {c.name}
                                    </SelectItem>
                                 ))}
                              </div>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-widest pl-1">Primary Wallet</Label>
                        <Select onValueChange={(val) => setFormData({...formData, account_id: val})} value={formData.account_id}>
                           <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-border/50 font-bold text-sm">
                              <SelectValue placeholder="Account" />
                           </SelectTrigger>
                           <SelectContent className="z-[300] bg-white border border-border rounded-xl">
                              {accounts.map((a) => (
                                 <SelectItem key={a.id} value={a.id.toString()} className="font-black uppercase text-[10px] tracking-widest py-3">
                                    {a.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-widest pl-1">Entry Timestamp</Label>
                        <Input type="date" className="h-11 rounded-xl bg-slate-50 border-border/50 font-bold text-sm px-3" value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-widest pl-1">Transaction Narration</Label>
                     <Textarea 
                        placeholder="Provide details..." 
                        className="rounded-xl h-20 bg-slate-50 border-border/50 font-bold text-xs p-3 focus:ring-accentOrange"
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                     />
                  </div>
               </form>
            </div>
            <DialogFooter className="p-6 pt-3 border-t border-border/50 bg-slate-50 flex-row gap-3">
               <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 rounded-xl font-black h-10 text-[10px] uppercase tracking-widest">Abort</Button>
               <Button onClick={handleSubmit} className="flex-1 bg-primary text-white h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all">
                  {editingItem ? 'Update' : 'Commit Outflow'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
