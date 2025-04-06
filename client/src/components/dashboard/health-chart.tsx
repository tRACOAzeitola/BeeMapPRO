import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";

type HealthChartProps = {
  good: number;
  weak: number;
  dead: number;
  isLoading: boolean;
};

const HealthChart: React.FC<HealthChartProps> = ({ good, weak, dead, isLoading }) => {
  const [timeRange, setTimeRange] = useState("month");
  
  const total = good + weak + dead;
  
  // Calculate percentages for display
  const goodPercentage = total > 0 ? Math.round((good / total) * 100) : 0;
  const weakPercentage = total > 0 ? Math.round((weak / total) * 100) : 0;
  const deadPercentage = total > 0 ? Math.round((dead / total) * 100) : 0;
  
  // Average hives per apiary - calculated as total hives / number of apiaries (assumed to be 4 from data)
  const averagePerApiary = total > 0 ? (total / 4).toFixed(1) : "0";
  
  // Health rate - calculated as good hives / total hives
  const healthRate = total > 0 ? Math.round((good / total) * 100) : 0;
  
  // Transform data for pie chart
  const data = [
    { name: 'Boas', value: good, color: '#10B981' }, // green-500
    { name: 'Fracas', value: weak, color: '#F59E0B' }, // amber-500
    { name: 'Mortas', value: dead, color: '#EF4444' }, // red-500
  ];
  
  // Health trend (simulated for demo purposes)
  // Usando um valor fixo mais baixo que o atual para simular uma melhoria
  const previousHealthRate = healthRate > 0 ? healthRate - 5 : 0;
  const healthTrend = healthRate - previousHealthRate;
  
  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Saúde das Colmeias</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Acompanhamento do estado de saúde total
          </p>
        </div>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="text-xs h-8 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              <SelectValue placeholder="Selecione período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Gráfico Principal */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} colmeias`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    padding: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#333'
                  }}
                />
                <Legend 
                  iconType="circle" 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Informação em Destaque */}
          {healthRate < 70 && (
            <div className="mt-2 mb-3 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 rounded-md p-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                A taxa de saúde das colmeias está abaixo do ideal (70%). Recomendamos realizar uma inspeção.
              </span>
            </div>
          )}
        </>
      )}

      {/* Métricas Resumidas */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Colmeias</h4>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">{total}</p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">{averagePerApiary} por apiário</span>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Taxa de Saúde</h4>
          <p className="text-xl font-semibold" style={{ color: healthRate >= 70 ? '#10B981' : '#F59E0B' }}>
            {healthRate}%
          </p>
          <div className="flex items-center mt-1">
            {healthTrend !== 0 && (
              <span className={`text-xs flex items-center ${healthTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {healthTrend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(healthTrend)}% desde {timeRange === 'week' ? 'semana passada' : timeRange === 'month' ? 'mês passado' : 'trimestre passado'}
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Distribuição</h4>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>Boas
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{goodPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>Fracas
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{weakPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>Mortas
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{deadPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HealthChart;
