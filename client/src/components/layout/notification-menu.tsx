import { useState } from 'react';
import { Link } from 'wouter';
import { Bell, CheckCircle, X, Eye, EyeOff, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification, NotificationType } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotifications
  } = useNotifications();

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diff / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else {
      return 'Agora mesmo';
    }
  };

  // Renderiza uma única notificação
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    return (
      <div className={cn(
        "p-3 border-b dark:border-gray-700 last:border-0 transition-colors",
        notification.read 
          ? "bg-transparent" 
          : notification.type === 'danger'
            ? "bg-red-50 dark:bg-red-950/20 border-l-2 border-l-red-500"
            : notification.type === 'warning'
              ? "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500"
              : notification.type === 'success'
                ? "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500"
                : "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
      )}>
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{getTypeIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium line-clamp-1">{notification.title}</h4>
              <div className="flex shrink-0 ml-2">
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => markAsRead(notification.id)}
                  >
                    <span className="sr-only">Marcar como lida</span>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-gray-400">
                {formatDate(notification.date)}
              </span>
              {notification.action && (
                <Link 
                  to={notification.action.href}
                  className={cn(
                    "text-xs font-medium",
                    notification.type === 'danger'
                      ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      : notification.type === 'warning'
                        ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        : notification.type === 'success'
                          ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                >
                  {notification.action.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determina a variante do badge baseada no tipo mais crítico de notificação
  const getHighestPriorityVariant = () => {
    if (!notifications.length) return "destructive";
    
    // Verificar se há notificações não lidas
    const unreadNotifications = notifications.filter(n => !n.read);
    if (!unreadNotifications.length) return "destructive";
    
    // Prioridade: danger > warning > success > info
    if (unreadNotifications.some(n => n.type === 'danger')) return "destructive";
    if (unreadNotifications.some(n => n.type === 'warning')) return "warning";
    if (unreadNotifications.some(n => n.type === 'success')) return "success";
    return "default";
  };

  // Classes personalizadas para badges de notificação
  const getBadgeClass = () => {
    const variant = getHighestPriorityVariant();
    const baseClass = "absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px]";
    
    switch (variant) {
      case "destructive":
        return `${baseClass} bg-red-500 text-white`;
      case "warning":
        return `${baseClass} bg-amber-500 text-white`;
      case "success":
        return `${baseClass} bg-green-500 text-white`;
      default:
        return `${baseClass} bg-blue-500 text-white`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={getBadgeClass()}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2.5">
          <DropdownMenuLabel className="text-base">Notificações</DropdownMenuLabel>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Ler todas
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Não há notificações para exibir.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-80">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            </ScrollArea>
            
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={clearNotifications}
              >
                Limpar todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}