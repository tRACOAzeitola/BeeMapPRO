import React from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/theme-context";
import {
  TrendingUp,
  Map,
  Grid,
  Package,
  Leaf,
  CloudSun,
  ChartBar,
  Satellite,
  Crown,
  X
} from "lucide-react";

export function MobileMenu() {
  const [location] = useLocation();
  const { sidebarOpen, setSidebarOpen } = useTheme();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Menu */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">BeeMap Pro</div>
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="px-2 py-4">
          <ul className="space-y-1">
            <MenuItem
              href="/"
              icon={<TrendingUp className="h-5 w-5" />}
              text="Dashboard"
              active={location === "/"}
            />
            <MenuItem
              href="/apiaries"
              icon={<Map className="h-5 w-5" />}
              text="Mapa de Apiários"
              active={location === "/apiaries"}
            />
            <MenuItem
              href="/hives"
              icon={<Grid className="h-5 w-5" />}
              text="Gestão de Colmeias"
              active={location === "/hives"}
            />
            <MenuItem
              href="/inventory"
              icon={<Package className="h-5 w-5" />}
              text="Inventário"
              active={location === "/inventory"}
            />
            <MenuItem
              href="/flora"
              icon={<Leaf className="h-5 w-5" />}
              text="Flora"
              active={location === "/flora"}
            />
            <MenuItem
              href="/climate"
              icon={<CloudSun className="h-5 w-5" />}
              text="Clima"
              active={location === "/climate"}
            />
          </ul>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Análises
            </h3>
            <ul className="mt-2 space-y-1">
              <MenuItem
                href="#"
                icon={<ChartBar className="h-5 w-5" />}
                text="Produtividade"
              />
              <MenuItem
                href="#"
                icon={<Satellite className="h-5 w-5" />}
                text="Dados Geoespaciais"
              />
            </ul>
          </div>

          {/* Premium Features */}
          <div className="mt-8 mx-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Recursos Premium
              </h3>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Desbloqueie análises avançadas e recomendações inteligentes
            </p>
            <button className="mt-3 w-full text-xs bg-amber-400 hover:bg-amber-500 text-gray-800 font-medium py-2 px-3 rounded-md transition-colors">
              Ver Planos
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

function MenuItem({ href, icon, text, active }: MenuItemProps) {
  return (
    <li>
      <Link href={href}>
        <a
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            active
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
          onClick={(e) => {
            // Prevent default to handle navigation manually
            // This ensures the menu closes properly on navigation
            e.preventDefault();
            window.location.href = href;
          }}
        >
          <span className="mr-3">{icon}</span>
          {text}
        </a>
      </Link>
    </li>
  );
}