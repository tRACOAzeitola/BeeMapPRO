import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import MapOverview from "@/components/dashboard/map-overview";
import HealthChart from "@/components/dashboard/health-chart";
import ClimateWidget from "@/components/dashboard/climate-widget";
import ApiaryList from "@/components/dashboard/apiary-list";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DashboardData = {
  apiaryCount: number;
  hiveCount: number;
  healthRate: number;
  alertCount: number;
  hiveStatus: {
    good: number;
    weak: number;
    dead: number;
  };
};

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  // Fetch apiaries for the list
  const { data: apiaries } = useQuery({
    queryKey: ['/api/apiaries'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visão geral da sua operação apícola</p>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total de Apiários"
          value={isLoading ? "..." : dashboardData?.apiaryCount.toString() || "0"}
          icon="th-large"
          trend="+1 no último mês"
          trendType="positive"
          color="primary"
        />
        
        <StatsCard 
          title="Total de Colmeias"
          value={isLoading ? "..." : dashboardData?.hiveCount.toString() || "0"}
          icon="archive"
          trend="+12 no último mês"
          trendType="positive"
          color="secondary"
        />
        
        <StatsCard 
          title="Saúde das Colmeias"
          value={isLoading ? "..." : `${dashboardData?.healthRate || 0}%`}
          icon="heartbeat"
          trend="-2% do mês anterior"
          trendType="warning"
          color="success"
        />
        
        <StatsCard 
          title="Alertas Ativos"
          value={isLoading ? "..." : dashboardData?.alertCount.toString() || "0"}
          icon="exclamation-triangle"
          trend="+3 na última semana"
          trendType="negative"
          color="danger"
        />
      </div>
      
      {/* Two Column Layout for Map and Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MapOverview apiaries={apiaries || []} />
        <HealthChart 
          good={dashboardData?.hiveStatus.good || 0}
          weak={dashboardData?.hiveStatus.weak || 0}
          dead={dashboardData?.hiveStatus.dead || 0}
          isLoading={isLoading}
        />
      </div>
      
      {/* Two Column Layout for Climate and Recent Apiaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClimateWidget />
        <ApiaryList apiaries={apiaries || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
