import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Leaf, Droplet, Search, BarChart2 } from "lucide-react";

type ProductionForecastProps = {
  isLoading?: boolean;
};

const mockForecastData = [
  { week: "Semana 1", forecast: 12 },
  { week: "Semana 2", forecast: 20 },
  { week: "Semana 3", forecast: 15 },
  { week: "Semana 4", forecast: 23 },
];

const mockRecommendations = [
  {
    id: 1,
    icon: "leaf",
    text: "Verificar floração de rosmaninho na próxima semana para otimizar produção"
  },
  {
    id: 2,
    icon: "droplet",
    text: "Considerar fontes de água adicionais devido às temperaturas elevadas"
  },
  {
    id: 3,
    icon: "search",
    text: "Agendar inspeção do Apiário Norte para avaliação sanitária"
  },
  {
    id: 4,
    icon: "chart",
    text: "Ampliar o Apiário Central para aproveitar pico de floração"
  }
];

const ProductionForecast: React.FC<ProductionForecastProps> = ({ isLoading }) => {
  // In a real application, we'd fetch forecast data
  // For now, we'll use mock data
  const { data: forecastData } = useQuery({
    queryKey: ['/api/production/forecast'],
    // Use mock data as placeholder
    initialData: mockForecastData,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations'],
    // Use mock data as placeholder
    initialData: mockRecommendations,
  });

  // Calculate total forecast
  const totalForecast = forecastData?.reduce((sum, item) => sum + item.forecast, 0) || 0;
  
  // Calculate average weekly forecast
  const avgWeekly = forecastData?.length > 0 
    ? Math.round(totalForecast / forecastData.length) 
    : 0;

  // Get icon component based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "leaf": return <Leaf className="h-4 w-4 text-green-500" />;
      case "droplet": return <Droplet className="h-4 w-4 text-blue-500" />;
      case "search": return <Search className="h-4 w-4 text-amber-500" />;
      case "chart": return <BarChart2 className="h-4 w-4 text-purple-500" />;
      default: return <Leaf className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Previsão de Produção</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Chart */}
        <div>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              {/* Forecast Chart */}
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecastData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="week" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis 
                      unit=" kg" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} kg`, 'Produção Estimada']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        padding: '6px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        color: '#333',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="forecast" 
                      fill="#3B82F6" 
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Forecast Summary */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Previsto</h4>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-400">{totalForecast} kg</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Média Semanal</h4>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">{avgWeekly} kg</p>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Right column - Recommendations */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recomendações
          </h4>
          <div className="space-y-2 overflow-auto max-h-[calc(100%-24px)]">
            {recommendations?.map((recommendation) => (
              <div 
                key={recommendation.id}
                className="flex items-start p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
              >
                <div className="mr-2 mt-0.5 flex-shrink-0">
                  {getIcon(recommendation.icon)}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                  {recommendation.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductionForecast; 