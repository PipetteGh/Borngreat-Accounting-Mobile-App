import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { accountService } from '@/services/accountService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus, Wallet, Banknote, CreditCard, 
  MoreVertical, ArrowUpRight, ArrowDownLeft, Trash2, Edit 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function Accounts() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    initial_balance: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Accounts | Borngreat Accounting';
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cash',
      initial_balance: ''
    });
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      initial_balance: (item.current_balance || item.initial_balance).toString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.initial_balance) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        initial_balance: parseFloat(formData.initial_balance)
      };
      if (editingItem) {
        await accountService.updateAccount({ ...payload, id: editingItem.id });
        toast.success('Account updated successfully');
      } else {
        await accountService.createAccount(payload);
        toast.success('Account created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save account');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this account? This will delete all associated transactions.')) return;
    try {
      await accountService.deleteAccount(id);
      toast.success('Account deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bank': return <Banknote className="w-5 h-5" />;
      case 'mobile_money': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bank': return 'bg-accentPurple/10 text-accentPurple';
      case 'mobile_money': return 'bg-accentOrange/10 text-accentOrange';
      default: return 'bg-accentGreen/10 text-accentGreen';
    }
  };

  const currency = user?.currency_symbol || '$';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tighter uppercase">Financial Wallets</h2>
          <p className="text-[#8E92A8] text-xs font-black uppercase tracking-[0.2em] opacity-60">Prime Entity Management</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-primary text-white rounded-lg h-9 px-5 gap-1.5 font-black uppercase tracking-widest text-[9px] shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {accounts.slice(0, 3).map((acc) => (
            <Card key={acc.id} className="rounded-xl border-border bg-white overflow-hidden group hover:translate-y-[-1px] transition-all duration-300 shadow-sm">
               <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6 ${getBgColor(acc.type)}`}>
                        <div className="scale-75">{getIcon(acc.type)}</div>
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-xl p-2 border-border bg-white shadow-xl">
                          <DropdownMenuItem onClick={() => handleOpenEdit(acc)} className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest cursor-pointer">
                             <Edit className="w-3.5 h-3.5 text-accentPurple" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(acc.id)} className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest cursor-pointer text-destructive">
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] mb-1">{acc.type?.replace('_', ' ')}</p>
                     <h3 className="text-sm font-black text-primary mb-1.5 truncate">{acc.name}</h3>
                     <div className="flex items-end justify-between">
                        <div className="text-base font-black tabular-nums text-primary tracking-tighter">
                           {currency}{parseFloat(acc.current_balance || acc.initial_balance || 0).toLocaleString()}
                        </div>
                        <span className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.2em] bg-slate-50 border border-border/50 px-2 py-0.5 rounded-full">
                           Prime
                        </span>
                     </div>
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>

      <Card className="rounded-xl border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-1 border-b border-border/50">
           <CardTitle className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Account Statements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-border">
                  <TableHead className="pl-6">Account Name</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Inflow</TableHead>
                  <TableHead className="text-center">Outflow</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={6} className="h-12 bg-slate-50/30"></TableCell>
                    </TableRow>
                  ))
                ) : accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <TableRow key={acc.id} className="group hover:bg-slate-50/50 transition-colors border-border">
                      <TableCell className="pl-6">
                         <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getBgColor(acc.type)}`}>
                               {getIcon(acc.type)}
                            </div>
                            <span className="font-black text-primary text-[13px] uppercase tracking-tighter">{acc.name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <span className="text-[8px] font-black uppercase text-secondary/60 tracking-[0.15em] px-2 py-0.5 bg-slate-50 rounded-lg border border-border/50">
                            {acc.type}
                         </span>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary tracking-tighter">
                        {currency}{parseFloat(acc.current_balance || acc.initial_balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center gap-1 text-accentGreen/40 font-black text-[9px] uppercase tracking-widest">
                            <ArrowDownLeft className="w-3 h-3" /> Inflow
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-accentOrange/40 font-black text-[9px] uppercase tracking-widest">
                            <ArrowUpRight className="w-3 h-3" /> Outflow
                         </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all">
                               <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-2 border-border bg-white shadow-xl">
                             <DropdownMenuItem onClick={() => handleOpenEdit(acc)} className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest cursor-pointer">
                                <Edit className="w-3.5 h-3.5 text-accentPurple" /> Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDelete(acc.id)} className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest cursor-pointer text-destructive">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center font-black uppercase text-[10px] tracking-[0.3em] text-secondary/30">
                        Zero Financial Entities
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CRUD Modal - Sharpened Layout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="rounded-xl bg-white border-none max-w-[380px] p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/50">
               <DialogTitle className="text-xl font-black text-primary tracking-tighter uppercase">
                  {editingItem ? 'Edit Identity' : 'Prime Identity'}
               </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">Wallet Designation</Label>
                  <Input 
                    className="h-11 rounded-xl bg-slate-50 border-border/50 focus:ring-primary font-bold placeholder:text-secondary/30 text-sm"
                    placeholder="e.g. Executive Reserve"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">Entity Classification</Label>
                  <Select onValueChange={(val) => setFormData({...formData, type: val})} value={formData.type}>
                     <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-border/50 font-bold text-sm">
                        <SelectValue placeholder="Select classification" />
                     </SelectTrigger>
                      <SelectContent className="z-[200] bg-white border border-border/50 shadow-2xl rounded-xl">
                         <SelectItem value="cash" className="rounded-lg font-black uppercase text-[10px] tracking-widest py-3 hover:bg-slate-50 cursor-pointer text-primary">Cash</SelectItem>
                         <SelectItem value="bank" className="rounded-lg font-black uppercase text-[10px] tracking-widest py-3 hover:bg-slate-50 cursor-pointer text-primary">Bank Entity</SelectItem>
                         <SelectItem value="mobile_money" className="rounded-lg font-black uppercase text-[10px] tracking-widest py-3 hover:bg-slate-50 cursor-pointer text-primary">Mobile Bridge</SelectItem>
                      </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">
                     {editingItem ? 'Active Liquidity' : 'Opening Liquidity'} ({currency})
                  </Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="h-11 rounded-xl bg-slate-50 border-border/50 focus:ring-primary font-black text-lg tracking-tighter"
                    placeholder="0.00"
                    value={formData.initial_balance}
                    onChange={(e) => setFormData({...formData, initial_balance: e.target.value})}
                  />
               </div>
            </div>
            <DialogFooter className="p-6 pt-3 flex items-center justify-end gap-3 bg-slate-50 border-t border-border/50">
               <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 text-secondary"
               >
                  Cancel
               </Button>
               <Button 
                onClick={handleSubmit} 
                className="bg-primary text-white px-8 h-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
               >
                  {editingItem ? 'Update Entity' : 'Deploy Entity'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
