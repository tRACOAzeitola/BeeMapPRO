import { Menu } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function MobileMenuButton() {
  const { setSidebarOpen } = useTheme();

  const handleOpenMenu = () => {
    setSidebarOpen(true);
  };

  return (
    <button
      onClick={handleOpenMenu}
      className="text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-300 focus:outline-none transition-colors"
      aria-label="Abrir menu lateral"
      title="Abrir menu lateral"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
} 