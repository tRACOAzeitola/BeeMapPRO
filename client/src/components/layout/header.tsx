import { useState } from "react";
import { Bug, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewMobileMenu } from "./new-mobile-menu";
import { NotificationMenu } from "./notification-menu";

export function Header() {
  const { isDarkMode, toggleDarkMode, toggleSidebar, sidebarOpen, setSidebarOpen } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        {/* Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {/* Versão desktop do botão do menu */}
          <div className="hidden lg:block">
            <button
              onClick={() => setSidebarOpen((prev: boolean) => !prev)}
              className="text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-300 focus:outline-none transition-colors"
              aria-label={sidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
              title={sidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          {/* Versão móvel do menu usando o componente Sheet */}
          <div className="lg:hidden">
            <NewMobileMenu />
          </div>
          
          <div className="flex items-center">
            <span className="text-amber-500 text-2xl">
              <Bug className="w-6 h-6" />
            </span>
            <h1 className="ml-2 text-xl font-bold text-amber-700 dark:text-amber-300">
              BeeMap Pro
            </h1>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationMenu />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-300"
            aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            title={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile */}
          <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center focus:outline-none" aria-label="Perfil de usuário" title="Perfil de usuário">
                <Avatar className="w-8 h-8 bg-amber-500 text-white">
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
