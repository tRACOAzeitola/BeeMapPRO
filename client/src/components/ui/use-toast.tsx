// Arquivo adaptado do shadcn/ui: https://ui.shadcn.com/docs/components/toast
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ 
    title, 
    description, 
    variant = "default", 
    duration = 5000 
  }: Omit<ToastProps, "id">) => {
    const id = uuidv4();
    const newToast: ToastProps = {
      id,
      title,
      description,
      variant,
      duration,
    };
    
    setToasts((current) => [...current, newToast]);
    
    // Remove automaticamente após a duração
    setTimeout(() => {
      dismiss(id);
    }, duration);
    
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return {
    toast,
    dismiss,
    toasts,
  };
}; 