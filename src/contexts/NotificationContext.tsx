import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from '../components/ui';
import type { Notification } from '../types/notification';

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id } as Notification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, [removeNotification]);

  const success = useCallback((message: string, title?: string) => 
    notify({ type: 'success', message, title }), [notify]);
  
  const error = useCallback((message: string, title?: string) => 
    notify({ type: 'error', message, title }), [notify]);
  
  const warning = useCallback((message: string, title?: string) => 
    notify({ type: 'warning', message, title }), [notify]);
  
  const info = useCallback((message: string, title?: string) => 
    notify({ type: 'info', message, title }), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info, removeNotification }}>
      {children}
      <ToastContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};
