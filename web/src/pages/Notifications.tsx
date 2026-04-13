import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, CheckCheck, Info, FileText, 
  AlertCircle, CheckCircle2, ChevronRight,
  Clock, MailOpen
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Notifications() {
  const { setUnreadCount: setGlobalUnread, unreadCount: globalUnread } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  useEffect(() => {
     document.title = 'Notifications | Borngreat Accounting';
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setGlobalUnread(res.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [setGlobalUnread]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setGlobalUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleRead = async (notification: any) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/mark-read/${notification.id}`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n));
        setGlobalUnread(Math.max(0, globalUnread - 1));
      } catch (e) { /* silent */ }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'report': return { icon: FileText, color: 'text-accentPurple', bg: 'bg-accentPurple/10' };
      case 'success': return { icon: CheckCircle2, color: 'text-accentGreen', bg: 'bg-accentGreen/10' };
      case 'warning': return { icon: AlertCircle, color: 'text-accentOrange', bg: 'bg-accentOrange/10' };
      default: return { icon: Info, color: 'text-accentCyan', bg: 'bg-accentCyan/10' };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
             <Bell className="w-8 h-8 text-accentPurple" /> Notifications
          </h2>
          <p className="text-secondary mt-1">Stay updated with your account activity and financial reports.</p>
        </div>
        {globalUnread > 0 && (
          <Button 
            onClick={markAllRead}
            variant="outline" 
            className="rounded-xl gap-2 font-bold text-accentPurple border-accentPurple/20 hover:bg-accentPurple/5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-surface border border-border animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <Card className="rounded-[2.5rem] border-border shadow-sm bg-surface p-20 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-[2rem] bg-background flex items-center justify-center mb-6">
                <MailOpen className="w-10 h-10 text-secondary/30" />
             </div>
             <h3 className="text-xl font-bold text-primary">All caught up!</h3>
             <p className="text-secondary max-w-xs mt-2">You don't have any new notifications at the moment.</p>
          </Card>
        ) : (
          notifications.map((n) => {
            const config = getIcon(n.type);
            const Icon = config.icon;
            return (
              <Card 
                key={n.id} 
                onClick={() => handleRead(n)}
                className={`rounded-[1.5rem] border-border shadow-sm transition-all cursor-pointer group hover:scale-[1.01] ${n.is_read ? 'bg-surface' : 'bg-background border-accentPurple/20 shadow-lg shadow-accentPurple/5'}`}
              >
                <CardContent className="p-6 flex items-start gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold ${n.is_read ? 'text-primary' : 'text-accentPurple'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-accentPurple" />
                      )}
                    </div>
                    <p className="text-sm text-secondary line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {formatDate(n.created_at)}
                       </div>
                       {!n.is_read && (
                         <span className="text-[10px] font-bold text-accentPurple uppercase tracking-widest">New</span>
                       )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="rounded-[2rem] bg-surface border-border max-w-lg">
          {selectedNotification && (() => {
            const config = getIcon(selectedNotification.type);
            const Icon = config.icon;
            return (
              <>
                <DialogHeader>
                   <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                         <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                         {selectedNotification.type} Notification
                      </div>
                   </div>
                   <DialogTitle className="text-2xl font-bold text-primary">{selectedNotification.title}</DialogTitle>
                   <DialogDescription className="text-xs flex items-center gap-2 pt-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatDate(selectedNotification.created_at)}
                   </DialogDescription>
                </DialogHeader>
                <div className="py-8 bg-background/50 rounded-3xl px-8 mt-4 border border-border/50">
                   <p className="text-primary leading-relaxed text-lg whitespace-pre-wrap">
                      "{selectedNotification.message}"
                   </p>
                </div>
                <div className="flex justify-end pt-6">
                   <Button 
                     onClick={() => setSelectedNotification(null)}
                     className="bg-accentPurple px-8 py-6 rounded-2xl font-bold shadow-lg shadow-accentPurple/20"
                   >
                      Close & Dismiss
                   </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
