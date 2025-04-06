import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen } = useTheme();
  
  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile, setSidebarOpen]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed lg:static inset-y-0 left-0 transform transition-transform duration-200 ease-in-out z-30 lg:z-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="mt-5 px-4">
          <div className="space-y-1">
            <NavItem href="/" icon={<TrendingUp />} active={location === "/"}>
              Dashboard
            </NavItem>
            <NavItem href="/apiaries" icon={<Map />} active={location === "/apiaries"}>
              Mapa de Apiários
            </NavItem>
            <NavItem href="/hives" icon={<Grid />} active={location === "/hives"}>
              Gestão de Colmeias
            </NavItem>
            <NavItem href="/inventory" icon={<Package />} active={location === "/inventory"}>
              Inventário
            </NavItem>
            <NavItem href="/flora" icon={<Leaf />} active={location === "/flora"}>
              Flora
            </NavItem>
            <NavItem href="/climate" icon={<CloudSun />} active={location === "/climate"}>
              Clima
            </NavItem>
          </div>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Análises
            </h3>
            <div className="mt-2 space-y-1">
              <NavItem href="#" icon={<ChartBar />}>
                Produtividade
              </NavItem>
              <NavItem href="#" icon={<Satellite />}>
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
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
        ></div>
      )}
    </>
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
    <Link href={href}>
      <a
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
          active
            ? "bg-amber-100 text-amber-700 dark:text-amber-300 dark:bg-amber-900/20"
            : "text-gray-600 hover:bg-gray-50 hover:text-amber-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-amber-300"
        }`}
      >
        <span className="w-5 h-5 mr-3">{icon}</span>
        {children}
      </a>
    </Link>
  );
}
