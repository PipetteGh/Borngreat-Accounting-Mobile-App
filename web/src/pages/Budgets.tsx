import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { budgetService } from '@/services/budgetService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Target, AlertTriangle, 
  ArrowLeft, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { useNavigate } from 'react-router-dom';

export default function Budgets() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const monthYear = new Date().toISOString().slice(0, 7);
  const currency = user?.currency_symbol || '$';

  const fetchData = useCallback(async () => {
    try {
      const data = await budgetService.getBudgets(monthYear);
      setBudgets(data);
    } catch (error) {
      toast.error('Failed to sync budgets');
    } finally {
      setLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    document.title = 'Budgets | Borngreat Accounting';
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (category: any) => {
    const existing = budgets.find(b => Number(b.category_id) === Number(category.id));
    setSelectedCategory(category);
    setAmount(existing ? existing.amount.toString() : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Invalid amount');
      return;
    }

    setIsSaving(true);
    try {
      await budgetService.saveBudget({
        category_id: selectedCategory.id,
        amount: parseFloat(amount),
        month_year: monthYear
      });
      toast.success('Budget updated');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update limit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this limit?')) return;
    try {
      await budgetService.deleteBudget(id);
      toast.success('Limit removed');
      fetchData();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const COLORS = ['#7c5dfa', '#26c986', '#ff914d', '#00c8e2', '#ffb020', '#e74c6f', '#8B5CF6', '#06b6d4'];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl h-9 w-9">
               <ArrowLeft className="w-5 h-5 text-secondary" />
            </Button>
            <h2 className="text-base font-black uppercase tracking-widest text-secondary text-center flex-1">Limits Dashboard</h2>
            <div className="w-9"></div>
         </div>

         <div className="space-y-0.5 px-1">
            <span className="text-[9px] font-black text-secondary/60 uppercase tracking-widest">Active Targets</span>
            <h3 className="text-2xl font-black text-primary tracking-tight">Spending Caps</h3>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Activity className="w-8 h-8 animate-spin text-accentPurple" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPENSE_CATEGORIES.map((category, idx) => {
            const budget = budgets.find(b => Number(b.category_id) === Number(category.id));
            const progress = budget ? (parseFloat(budget.actual_spend || 0) / parseFloat(budget.amount)) : 0;
            const isOver = progress >= 1;
            const barColor = COLORS[idx % COLORS.length];

            return (
              <Card 
                key={category.id} 
                className="group rounded-xl border-border bg-surface hover:translate-y-[-1px] transition-all cursor-pointer overflow-hidden shadow-sm"
                onClick={() => handleOpenModal(category)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: barColor + '10', color: barColor }}>
                           <Target className="w-4 h-4" />
                        </div>
                        <div>
                           <h4 className="font-extrabold text-primary text-sm tracking-tight">{category.name}</h4>
                           <p className="text-[9px] font-bold text-secondary uppercase tracking-tight">
                              {isOver ? 'CRITICAL' : 'TRACKING'}
                           </p>
                        </div>
                     </div>
                     {isOver && <AlertTriangle className="w-4 h-4 text-accentOrange animate-pulse" />}
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-baseline text-[10px] font-bold text-secondary/50">
                        <span>CONSUMED</span>
                        <span className={`font-black ${isOver ? 'text-accentOrange' : 'text-primary'}`}>
                           {budget 
                              ? `${currency}${parseFloat(budget.actual_spend || 0).toLocaleString()}` 
                              : "N/A"}
                        </span>
                     </div>
                     <Progress value={Math.min(progress * 100, 100)} className="h-1 rounded-full bg-background border border-border/20" />
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-secondary/40">
                        <span>{(progress * 100).toFixed(0)}%</span>
                        {budget && (
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(budget.id); }} className="text-accentOrange hover:underline">
                              DROP
                           </button>
                        )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="rounded-xl bg-surface border-border max-w-[300px] p-0 overflow-hidden shadow-2xl">
            <div className="p-5 text-center">
               <h4 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-6">{selectedCategory?.name}</h4>
               
               <div className="flex items-center justify-center gap-1.5 mb-8">
                  <span className="text-xl font-bold text-secondary">{currency}</span>
                  <Input 
                     type="number"
                     step="0.01"
                     autoFocus
                     className="text-3xl font-black h-12 text-center border-none focus-visible:ring-0 bg-transparent p-0 w-32"
                     placeholder="0.00"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-primary h-11 rounded-xl font-bold text-xs text-white w-full">
                     {isSaving ? "Syncing..." : "Set Target"}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-10 rounded-lg text-secondary text-[10px] font-bold">
                     CLOSE
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
