import { useState } from "react";
import { Bug, Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { isDarkMode, toggleDarkMode, setSidebarOpen } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        {/* Logo and Mobile Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
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
          <button className="text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-300 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-300"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile */}
          <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center focus:outline-none">
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
