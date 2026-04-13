import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { useAuthStore } from '@/store/authStore';
import { accountService, type Account } from '@/services/accountService';
import api from '@/services/api';
import { Loader2, Calendar as CalendarIcon, Wallet, Layers, FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  editTransaction?: any;
  initialType?: 'income' | 'expense';
}

export default function TransactionModal({ open, onOpenChange, onSave, editTransaction, initialType = 'expense' }: Props) {
  const { user } = useAuthStore();
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [accountId, setAccountId] = useState<number | string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (open) {
      accountService.getAccounts().then(setAccounts);
    }
  }, [open]);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.category_id.toString());
      setAccountId(editTransaction.account_id.toString());
      setDescription(editTransaction.description || '');
      setDate(new Date(editTransaction.transaction_date).toISOString().split('T')[0]);
    } else {
      setType(initialType);
      setAmount('');
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editTransaction, open, initialType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !accountId) return;

    setLoading(true);
    try {
      const payload = { 
        type, 
        amount: parseFloat(amount), 
        category_id: parseInt(categoryId as string), 
        account_id: parseInt(accountId as string),
        description, 
        transaction_date: date 
      };

      if (editTransaction) {
        await api.put(`/transactions/${editTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border bg-surface shadow-2xl overflow-hidden p-0">
        <DialogHeader className="p-8 bg-background/50 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-primary">
            {editTransaction ? 'Edit Transaction' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="p-8 space-y-6">
            <div className="flex bg-background p-1 rounded-2xl border border-border">
               {(['income', 'expense'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "ghost"}
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-xl transition-all capitalize font-bold ${type === t ? (t === 'income' ? 'bg-accentGreen hover:bg-accentGreen' : 'bg-accentOrange hover:bg-accentOrange') : 'text-secondary'}`}
                >
                  {t}
                </Button>
              ))}
            </div>

            <div className="text-center space-y-2 py-4">
               <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Amount</Label>
               <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-primary">{user?.currency_symbol || '$'}</span>
                  <Input 
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-4xl font-black text-center border-none shadow-none focus-visible:ring-0 bg-transparent w-auto min-w-[150px]"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest flex items-center gap-2">
                   <Wallet className="w-3 h-3" /> Account
                </Label>
                <Select value={accountId.toString()} onValueChange={setAccountId}>
                  <SelectTrigger className="rounded-xl border-border h-12">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest flex items-center gap-2">
                   <Layers className="w-3 h-3" /> Category
                </Label>
                <Select value={categoryId.toString()} onValueChange={setCategoryId}>
                  <SelectTrigger className="rounded-xl border-border h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary scale-75" />
                <Input 
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 rounded-xl h-12 border-border"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary scale-75" />
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 rounded-xl h-12 border-border"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0">
             <Button 
              type="submit" 
              disabled={loading}
              className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl transition-all ${type === 'income' ? 'bg-accentGreen hover:bg-accentGreen shadow-accentGreen/20' : 'bg-accentOrange hover:bg-accentOrange shadow-accentOrange/20'}`}
             >
                {loading ? <Loader2 className="animate-spin" /> : 'Save Transaction'}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
