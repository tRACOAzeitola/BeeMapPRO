import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Apiaries from "@/pages/apiaries";
import Hives from "@/pages/hives";
import Inventory from "@/pages/inventory";
import Flora from "@/pages/flora";
import Climate from "@/pages/climate";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useTheme } from "@/contexts/theme-context";

function Router() {
  const { sidebarOpen } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MobileMenu />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 transition-all duration-200 ease-in-out">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/apiaries" component={Apiaries} />
            <Route path="/hives" component={Hives} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/flora" component={Flora} />
            <Route path="/climate" component={Climate} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { isDarkMode } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <div className={isDarkMode ? "dark" : ""}>
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
