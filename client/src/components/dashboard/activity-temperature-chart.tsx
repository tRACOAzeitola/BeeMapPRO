import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ActivityTemperatureProps = {
  isLoading?: boolean;
};

const mockData = [
  { day: "Seg", activityPercent: 65, temperature: 21 },
  { day: "Ter", activityPercent: 70, temperature: 23 },
  { day: "Qua", activityPercent: 55, temperature: 19 },
  { day: "Qui", activityPercent: 80, temperature: 25 },
  { day: "Sex", activityPercent: 85, temperature: 28 },
  { day: "Sáb", activityPercent: 75, temperature: 24 },
  { day: "Dom", activityPercent: 60, temperature: 20 },
];

const ActivityTemperatureChart: React.FC<ActivityTemperatureProps> = ({ isLoading }) => {
  // In a real application, we'd fetch activity/temperature data
  // For now, we'll use mock data
  const { data: activityData } = useQuery({
    queryKey: ['/api/activity/weekly'],
    // Use mock data as placeholder
    initialData: mockData,
  });

  // Calculate averages
  const avgActivity = activityData 
    ? Math.round(activityData.reduce((sum, item) => sum + item.activityPercent, 0) / activityData.length) 
    : 0;
  
  const avgTemperature = activityData 
    ? Math.round(activityData.reduce((sum, item) => sum + item.temperature, 0) / activityData.length * 10) / 10 
    : 0;

  // Find peak day
  const peakDay = activityData?.reduce((max, item) => 
    item.activityPercent > max.activityPercent ? item : max, 
    { day: '', activityPercent: 0, temperature: 0 }
  );

  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Atividade vs. Temperatura</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Activity/Temperature Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, 35]}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'activityPercent') return [`${value}%`, 'Atividade'];
                    if (name === 'temperature') return [`${value}°C`, 'Temperatura'];
                    return [value, name];
                  }}
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
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="activityPercent" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                  name="Atividade"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                  name="Temperatura"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Metrics Summary */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Atividade Média</h4>
              <p className="text-base font-semibold text-purple-600 dark:text-purple-400">{avgActivity}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Temperatura Média</h4>
              <p className="text-base font-semibold text-amber-500">{avgTemperature}°C</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pico de Atividade</h4>
              <p className="text-base font-semibold text-gray-800 dark:text-white">{peakDay?.day}</p>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {peakDay?.activityPercent}% a {peakDay?.temperature}°C
              </span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default ActivityTemperatureChart; 