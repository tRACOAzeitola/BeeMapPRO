import React from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/theme-context";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Menu
} from "lucide-react";
import { Link } from "wouter";

export function NewMobileMenu() {
  const [location] = useLocation();
  const [open, setOpen] = React.useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-300 focus:outline-none transition-colors"
          aria-label="Abrir menu lateral"
          title="Abrir menu lateral"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 pt-0 w-[80%] max-w-[300px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">BeeMap Pro</div>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <ul className="space-y-1.5">
              <MenuItem 
                href="/" 
                icon={<TrendingUp className="h-5 w-5" />} 
                label="Dashboard"
                active={location === "/"}
                onClick={() => setOpen(false)}
              />
              <MenuItem 
                href="/apiaries" 
                icon={<Map className="h-5 w-5" />} 
                label="Mapa de Apiários"
                active={location === "/apiaries"}
                onClick={() => setOpen(false)}
              />
              <MenuItem 
                href="/hives" 
                icon={<Grid className="h-5 w-5" />} 
                label="Gestão de Colmeias"
                active={location === "/hives"}
                onClick={() => setOpen(false)}
              />
              <MenuItem 
                href="/inventory" 
                icon={<Package className="h-5 w-5" />} 
                label="Inventário"
                active={location === "/inventory"}
                onClick={() => setOpen(false)}
              />
              <MenuItem 
                href="/flora" 
                icon={<Leaf className="h-5 w-5" />} 
                label="Flora"
                active={location === "/flora"}
                onClick={() => setOpen(false)}
              />
              <MenuItem 
                href="/climate" 
                icon={<CloudSun className="h-5 w-5" />} 
                label="Clima"
                active={location === "/climate"}
                onClick={() => setOpen(false)}
              />
            </ul>
            
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Análises
              </h3>
              <ul className="mt-2 space-y-1.5">
                <MenuItem 
                  href="#" 
                  icon={<ChartBar className="h-5 w-5" />} 
                  label="Produtividade"
                  onClick={() => setOpen(false)}
                />
                <MenuItem 
                  href="#" 
                  icon={<Satellite className="h-5 w-5" />} 
                  label="Dados Geoespaciais"
                  onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function MenuItem({ href, icon, label, active, onClick }: MenuItemProps) {
  return (
    <li>
      <Link href={href}>
        <div 
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer ${
            active
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
          onClick={onClick}
        >
          <span className="mr-3">{icon}</span>
          {label}
        </div>
      </Link>
    </li>
  );
}