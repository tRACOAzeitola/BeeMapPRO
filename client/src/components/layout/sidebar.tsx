import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@/contexts/theme-context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  TrendingUp,
  Map,
  Grid,
  Package,
  Leaf,
  CloudSun,
  ChartBar,
  Satellite, 
  Crown
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { sidebarOpen } = useTheme();
  
  // Em dispositivos móveis ou quando o sidebar está fechado, não renderiza nada
  if (isMobile || !sidebarOpen) {
    return null;
  }

  return (
    <div className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="mt-5 px-4 pb-8">
        <div className="space-y-1">
          <NavItem href="/app/dashboard" icon={<TrendingUp />} active={location.pathname === "/app/dashboard"}>
            Dashboard
          </NavItem>
          <NavItem href="/app/apiaries" icon={<Map />} active={location.pathname === "/app/apiaries"}>
            Mapa de Apiários
          </NavItem>
          <NavItem href="/app/hives" icon={<Grid />} active={location.pathname === "/app/hives"}>
            Gestão de Colmeias
          </NavItem>
          <NavItem href="/app/inventory" icon={<Package />} active={location.pathname === "/app/inventory"}>
            Inventário
          </NavItem>
          <NavItem href="/app/flora" icon={<Leaf />} active={location.pathname === "/app/flora"}>
            Flora
          </NavItem>
          <NavItem href="/app/climate" icon={<CloudSun />} active={location.pathname === "/app/climate"}>
            Clima
          </NavItem>
        </div>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Análises
          </h3>
          <div className="mt-2 space-y-1">
            <NavItem href="/app/productivity" icon={<ChartBar />} active={location.pathname === "/app/productivity"}>
              Produtividade
            </NavItem>
            <NavItem href="/app/geospatial" icon={<Satellite />} active={location.pathname === "/app/geospatial"}>
              Dados Geoespaciais
            </NavItem>
          </div>
        </div>

        {/* Premium Features (Locked) */}
        <div className="mt-8">
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <Crown className="w-4 h-4 text-amber-500 mr-2" />
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
        </div>
      </nav>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
};

function NavItem({ href, icon, active, children }: NavItemProps) {
  return (
    <Link to={href} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
      active
        ? "bg-amber-100 text-amber-700 dark:text-amber-300 dark:bg-amber-900/20"
        : "text-gray-600 hover:bg-gray-50 hover:text-amber-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-amber-300"
    }`}>
      <span className="w-5 h-5 mr-3">{icon}</span>
      {children}
    </Link>
  );
}