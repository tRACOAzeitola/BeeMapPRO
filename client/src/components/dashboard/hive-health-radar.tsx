import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

type HiveHealthRadarProps = {
  isLoading?: boolean;
};

const mockData = [
  { attribute: "Força", value: 85 },
  { attribute: "Saúde Geral", value: 75 },
  { attribute: "Produtividade", value: 70 },
  { attribute: "Qualidade", value: 90 },
  { attribute: "Resistência", value: 80 },
];

const HiveHealthRadar: React.FC<HiveHealthRadarProps> = ({ isLoading }) => {
  // In a real application, we'd fetch health data
  // For now, we'll use mock data
  const { data: healthData } = useQuery({
    queryKey: ['/api/hives/health-radar'],
    // Use mock data as placeholder
    initialData: mockData,
  });

  // Calculate overall health score (average of all attributes)
  const overallHealth = healthData 
    ? Math.round(healthData.reduce((sum, item) => sum + item.value, 0) / healthData.length) 
    : 0;
  
  // Find highest and lowest attributes
  const highestAttribute = healthData?.reduce((max, item) => 
    item.value > max.value ? item : max, 
    { attribute: '', value: 0 }
  );
  
  const lowestAttribute = healthData?.reduce((min, item) => 
    item.value < min.value ? item : min, 
    { attribute: '', value: 100 }
  );

  // Health status text based on overall score
  const getHealthStatus = (score: number) => {
    if (score >= 85) return "Excelente";
    if (score >= 70) return "Bom";
    if (score >= 50) return "Regular";
    return "Precisa de Atenção";
  };

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Saúde das Colmeias</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avaliação dos principais indicadores de saúde
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Health Radar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={healthData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="attribute" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <PolarRadiusAxis 
                  angle={18} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickCount={5}
                  axisLine={false}
                />
                <Radar
                  name="Saúde"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Metrics Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status Geral</h4>
              <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">{overallHealth}%</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {getHealthStatus(overallHealth)}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ponto Forte</h4>
              <p className="text-xl font-semibold text-green-500">{highestAttribute?.attribute}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {highestAttribute?.value}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Área de Melhoria</h4>
              <p className="text-xl font-semibold text-amber-500">{lowestAttribute?.attribute}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {lowestAttribute?.value}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default HiveHealthRadar; 