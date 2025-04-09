import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import LandingPage from "./LandingPage";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useTheme } from "@/contexts/theme-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ThemeProvider } from "@/contexts/theme-context";

// Layout component for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 transition-all duration-200 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Here you would typically check for authentication
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected routes */}
      <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/apiaries" element={<ProtectedRoute><Apiaries /></ProtectedRoute>} />
      <Route path="/app/hives" element={<ProtectedRoute><Hives /></ProtectedRoute>} />
      <Route path="/app/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/app/flora" element={<ProtectedRoute><Flora /></ProtectedRoute>} />
      <Route path="/app/climate" element={<ProtectedRoute><Climate /></ProtectedRoute>} />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
