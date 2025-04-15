import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SimpleToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
  duration?: number;
  onClose: (id: string) => void;
}

export const SimpleToast: React.FC<SimpleToastProps> = ({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Tempo para a animação de saída
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30";
      default:
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div
        className={`rounded-md shadow-md border p-4 max-w-md ${getBackgroundColor()}`}
      >
        <div className="flex items-start">
          {getIcon() && <div className="flex-shrink-0 mr-3">{getIcon()}</div>}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(id), 300);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SimpleToaster: React.FC<{ toasts: SimpleToastProps[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((toast) => (
        <SimpleToast key={toast.id} {...toast} />
      ))}
    </div>
  );
}; 