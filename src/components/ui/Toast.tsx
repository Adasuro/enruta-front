import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Notification } from '../../types/notification';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="shrink-0 mt-0.5 text-success-500" size={20} />,
    error: <XCircle className="shrink-0 mt-0.5 text-danger-500" size={20} />,
    warning: <AlertTriangle className="shrink-0 mt-0.5 text-warning" size={20} />,
    info: <Info className="shrink-0 mt-0.5 text-info" size={20} />
  };

  const borders = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning',
    info: 'border-l-info'
  };

  return (
    <div className={`flex items-start justify-between w-[350px] max-w-[calc(100vw-48px)] p-4 bg-white rounded-lg shadow-lg border-l-4 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 max-md:w-full max-md:max-w-full max-md:m-0 max-md:rounded-xl ${borders[notification.type]}`} role="alert">
      <div className="flex gap-3 items-start">
        {icons[notification.type]}
        <div className="flex flex-col gap-1">
          {notification.title && <h4 className="m-0 text-sm font-bold text-gray-900">{notification.title}</h4>}
          <p className="m-0 text-[0.8125rem] text-gray-700 leading-snug">{notification.message}</p>
        </div>
      </div>
      <button 
        className="bg-transparent border-none text-gray-500 cursor-pointer p-1 flex items-center justify-center rounded transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900" 
        onClick={() => onClose(notification.id)}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 bottom-auto flex flex-col gap-3 z-[9999] pointer-events-none max-md:top-4 max-md:right-4 max-md:left-4 max-md:p-0 max-md:w-auto max-md:items-stretch">
      {notifications.map((notif) => (
        <Toast key={notif.id} notification={notif} onClose={onClose} />
      ))}
    </div>
  );
};
