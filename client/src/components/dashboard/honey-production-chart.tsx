import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type HoneyProductionProps = {
  isLoading?: boolean;
};

const mockData = [
  { month: "Jan", production: 0 },
  { month: "Fev", production: 0 },
  { month: "Mar", production: 8 },
  { month: "Abr", production: 15 },
  { month: "Mai", production: 25 },
  { month: "Jun", production: 45 },
  { month: "Jul", production: 35 },
  { month: "Ago", production: 25 },
  { month: "Set", production: 15 },
  { month: "Out", production: 10 },
  { month: "Nov", production: 5 },
  { month: "Dez", production: 0 },
];

const HoneyProductionChart: React.FC<HoneyProductionProps> = ({ isLoading }) => {
  // In a real application, we'd fetch production data
  // For now, we'll use mock data
  const { data: productionData } = useQuery({
    queryKey: ['/api/production/annual'],
    // Use mock data as placeholder
    initialData: mockData,
  });

  // Calculate total annual production
  const totalProduction = productionData?.reduce((sum, item) => sum + item.production, 0) || 0;
  
  // Calculate average monthly production (excluding months with zero production)
  const productiveMonths = productionData?.filter(month => month.production > 0) || [];
  const averageMonthly = productiveMonths.length > 0 
    ? (totalProduction / productiveMonths.length).toFixed(1) 
    : "0";

  // Target value for comparison
  const targetProduction = 30;

  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Produção Anual de Mel</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Production Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={productionData}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  unit=" kg" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} kg`, 'Produção']}
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
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorProduction)" 
                />
                {/* Target line */}
                <CartesianGrid
                  horizontal={false}
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  y={targetProduction}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Metrics Summary */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Produção Total</h4>
              <p className="text-base font-semibold text-gray-800 dark:text-white">{totalProduction} kg</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Média Mensal</h4>
              <p className="text-base font-semibold text-gray-800 dark:text-white">{averageMonthly} kg</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Meta Mensal</h4>
              <p className="text-base font-semibold text-amber-500">{targetProduction} kg</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default HoneyProductionChart; 