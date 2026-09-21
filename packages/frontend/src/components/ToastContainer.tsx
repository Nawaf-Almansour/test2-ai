import React from 'react';
import { useToast } from '../hooks/useToast';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from './ui/Toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <ToastProvider>
      <ToastViewport />
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.type}
          onOpenChange={(open) => !open && removeToast(toast.id)}
          duration={toast.duration}
        >
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.message && <ToastDescription>{toast.message}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  );
};