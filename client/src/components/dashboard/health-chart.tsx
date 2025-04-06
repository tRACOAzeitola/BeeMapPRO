import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type HealthChartProps = {
  good: number;
  weak: number;
  dead: number;
  isLoading: boolean;
};

const HealthChart: React.FC<HealthChartProps> = ({ good, weak, dead, isLoading }) => {
  const [timeRange, setTimeRange] = useState("month");
  
  const total = good + weak + dead;
  
  // Calculate percentages for the height of chart
  const goodPercentage = total > 0 ? Math.round((good / total) * 100) : 0;
  const weakPercentage = total > 0 ? Math.round((weak / total) * 100) : 0;
  const deadPercentage = total > 0 ? Math.round((dead / total) * 100) : 0;
  
  // Average hives per apiary - calculated as total hives / number of apiaries (assumed to be 8 from stats)
  const averagePerApiary = total > 0 ? (total / 8).toFixed(1) : "0";
  
  // Health rate - calculated as good hives / total hives
  const healthRate = total > 0 ? Math.round((good / total) * 100) : 0;

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 dark:text-white">Saúde das Colmeias</h3>
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
        <div className="h-64 relative">
          <div className="flex h-full items-end space-x-1 px-8">
            <div className="w-1/3 flex flex-col items-center">
              <div className={`bg-green-500 w-full rounded-t-md`} style={{ height: `${goodPercentage}%` }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Boas<br/>({good})</p>
            </div>
            <div className="w-1/3 flex flex-col items-center">
              <div className={`bg-amber-500 w-full rounded-t-md`} style={{ height: `${weakPercentage}%` }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Fracas<br/>({weak})</p>
            </div>
            <div className="w-1/3 flex flex-col items-center">
              <div className={`bg-red-500 w-full rounded-t-md`} style={{ height: `${deadPercentage}%` }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Mortas<br/>({dead})</p>
            </div>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 py-1">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <h4 className="text-xs text-gray-500 dark:text-gray-400">Total</h4>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{total}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <h4 className="text-xs text-gray-500 dark:text-gray-400">Média/Apiário</h4>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{averagePerApiary}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <h4 className="text-xs text-gray-500 dark:text-gray-400">Taxa de Saúde</h4>
          <p className="text-lg font-semibold text-green-500">{healthRate}%</p>
        </div>
      </div>
    </Card>
  );
};

export default HealthChart;
