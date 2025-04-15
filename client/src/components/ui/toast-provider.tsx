import React, { createContext, useContext } from "react";
import { useToast as useToastHook, ToastProps } from "./use-toast";
import { CustomToast } from "./toast";

// Contexto para o sistema de toast
export const ToastContext = createContext<ReturnType<typeof useToastHook> | null>(null);

// Hook para facilitar o acesso ao contexto
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
};

// Provider que inclui a lógica e os componentes de toast
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToastHook();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toast.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <CustomToast
              id={t.id}
              title={t.title}
              description={t.description}
              variant={t.variant as any}
              duration={t.duration}
              onClose={toast.dismiss}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 