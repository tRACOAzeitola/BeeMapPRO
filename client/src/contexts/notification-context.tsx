import React, { createContext, useContext, useState, useEffect } from 'react';
import { Apiary, Hive, WeatherData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Definição de tipos para as notificações
export type NotificationType = 'info' | 'warning' | 'danger' | 'success';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: Date;
  read: boolean;
  source: 'hive' | 'apiary' | 'weather' | 'system';
  sourceId?: number;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
        return [];
      }
    }
    return [];
  });
  
  const { toast } = useToast();
  
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Salvar notificações no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // Adicionar nova notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar toast para notificações novas
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'danger' ? 'destructive' : 
               notification.type === 'warning' ? 'warning' : 'default',
    });
  };
  
  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };
  
  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  // Limpar todas as notificações
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  return (
    <NotificationContext.Provider 
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Utilitários para gerar notificações baseadas em eventos do sistema
export const createHiveHealthNotification = (hive: Hive): Omit<Notification, 'id' | 'date' | 'read'> => {
  const healthStatus = hive.status.toLowerCase();
  
  if (healthStatus === 'weak') {
    return {
      title: 'Alerta de Saúde da Colmeia',
      message: `A colmeia ${hive.name} está fraca e pode precisar de atenção.`,
      type: 'warning',
      source: 'hive',
      sourceId: hive.id,
      action: {
        label: 'Ver Colmeia',
        href: '/hives'
      }
    };
  } else if (healthStatus === 'dead') {
    return {
      title: 'Colmeia Perdida',
      message: `A colmeia ${hive.name} foi registrada como perdida.`,
      type: 'danger',
      source: 'hive',
      sourceId: hive.id,
      action: {
        label: 'Ver Colmeia',
        href: '/hives'
      }
    };
  }
  
  return {
    title: 'Status da Colmeia Atualizado',
    message: `A colmeia ${hive.name} está em boas condições.`,
    type: 'info',
    source: 'hive',
    sourceId: hive.id
  };
};

export const createWeatherAlertNotification = (apiary: Apiary, weather: WeatherData): Omit<Notification, 'id' | 'date' | 'read'> => {
  // Verificar condições climáticas adversas
  if (weather.temperature < 10) {
    return {
      title: 'Alerta de Temperatura Baixa',
      message: `Temperatura em ${apiary.name} está abaixo de 10°C. Considere medidas para proteger as colmeias.`,
      type: 'warning',
      source: 'weather',
      sourceId: apiary.id,
      action: {
        label: 'Ver Clima',
        href: '/climate'
      }
    };
  } else if (weather.temperature > 35) {
    return {
      title: 'Alerta de Temperatura Alta',
      message: `Temperatura em ${apiary.name} está acima de 35°C. As colmeias podem precisar de ventilação adicional.`,
      type: 'warning',
      source: 'weather',
      sourceId: apiary.id,
      action: {
        label: 'Ver Clima',
        href: '/climate'
      }
    };
  } else if (weather.conditions && (weather.conditions.toLowerCase().includes('storm') || weather.conditions.toLowerCase().includes('heavy rain'))) {
    return {
      title: 'Alerta de Tempestade',
      message: `Previsão de tempestade para ${apiary.name}. Verifique a segurança das colmeias.`,
      type: 'danger',
      source: 'weather',
      sourceId: apiary.id,
      action: {
        label: 'Ver Clima',
        href: '/climate'
      }
    };
  }
  
  // Condição ideal para inspeção
  if (weather.temperature > 15 && weather.temperature < 30 && 
      weather.humidity > 30 && weather.humidity < 70) {
    return {
      title: 'Condições Ideais para Inspeção',
      message: `As condições climáticas em ${apiary.name} estão ideais para inspeção das colmeias hoje.`,
      type: 'success',
      source: 'weather',
      sourceId: apiary.id,
      action: {
        label: 'Ver Apiário',
        href: '/apiaries'
      }
    };
  }
  
  return {
    title: 'Atualização Climática',
    message: `Novas informações climáticas disponíveis para ${apiary.name}.`,
    type: 'info',
    source: 'weather',
    sourceId: apiary.id
  };
};

export const createFloraNotification = (apiaryId: number, floraType: string): Omit<Notification, 'id' | 'date' | 'read'> => {
  return {
    title: 'Floração Detectada',
    message: `Detectada floração de ${floraType} próxima ao seu apiário.`,
    type: 'info',
    source: 'apiary',
    sourceId: apiaryId,
    action: {
      label: 'Ver Flora',
      href: '/flora'
    }
  };
};