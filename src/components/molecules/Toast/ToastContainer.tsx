import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Notification } from '../../../contexts/NotificationContext';
import './Toast.css';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="toast-icon toast-icon--success" size={20} />,
    error: <XCircle className="toast-icon toast-icon--error" size={20} />,
    warning: <AlertTriangle className="toast-icon toast-icon--warning" size={20} />,
    info: <Info className="toast-icon toast-icon--info" size={20} />
  };

  return (
    <div className={`toast toast--${notification.type}`}>
      <div className="toast-content">
        {icons[notification.type]}
        <div className="toast-text">
          {notification.title && <h4 className="toast-title">{notification.title}</h4>}
          <p className="toast-message">{notification.message}</p>
        </div>
      </div>
      <button className="toast-close" onClick={() => onClose(notification.id)}>
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
    <div className="toast-container">
      {notifications.map((notif) => (
        <Toast key={notif.id} notification={notif} onClose={onClose} />
      ))}
    </div>
  );
};
