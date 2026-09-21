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
          variant={toast.variant}
          onOpenChange={(open) => !open && removeToast(toast.id)}
          duration={toast.duration}
        >
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="absolute right-8 top-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {toast.action.label}
            </button>
          )}
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  );
};