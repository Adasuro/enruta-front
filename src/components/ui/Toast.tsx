import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Notification } from '../../types/notification';
import './Toast.css';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="ui-toast__icon ui-toast__icon--success" size={20} />,
    error: <XCircle className="ui-toast__icon ui-toast__icon--error" size={20} />,
    warning: <AlertTriangle className="ui-toast__icon ui-toast__icon--warning" size={20} />,
    info: <Info className="ui-toast__icon ui-toast__icon--info" size={20} />
  };

  return (
    <div className={`ui-toast ui-toast--${notification.type}`} role="alert">
      <div className="ui-toast__content">
        {icons[notification.type]}
        <div className="ui-toast__text">
          {notification.title && <h4 className="ui-toast__title">{notification.title}</h4>}
          <p className="ui-toast__message">{notification.message}</p>
        </div>
      </div>
      <button 
        className="ui-toast__close" 
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
    <div className="ui-toast-container">
      {notifications.map((notif) => (
        <Toast key={notif.id} notification={notif} onClose={onClose} />
      ))}
    </div>
  );
};
