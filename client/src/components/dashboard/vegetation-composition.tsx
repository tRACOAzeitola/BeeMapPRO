import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type VegetationCompositionProps = {
  isLoading?: boolean;
};

const mockData = [
  { name: "Rosmaninho", value: 45, color: "#8884d8" },
  { name: "Eucalipto", value: 20, color: "#3BB77E" },
  { name: "Medronheiro", value: 15, color: "#FF6B6B" },
  { name: "Laranjeira", value: 10, color: "#FFA800" },
  { name: "Outros", value: 10, color: "#36A2EB" },
];

const VegetationComposition: React.FC<VegetationCompositionProps> = ({ isLoading }) => {
  // In a real application, we'd fetch vegetation data
  // For now, we'll use mock data
  const { data: vegetationData } = useQuery({
    queryKey: ['/api/vegetation/composition'],
    // Use mock data as placeholder
    initialData: mockData,
  });

  // Find dominant vegetation
  const dominantVegetation = vegetationData?.reduce((max, item) => 
    item.value > max.value ? item : max, 
    { name: '', value: 0 }
  );

  // Calculate diversity score (1-10 scale based on number of vegetation types and distribution)
  const vegetationTypes = vegetationData?.length || 0;
  const diversityScore = Math.min(10, Math.round((vegetationTypes * 1.5) + 2));

  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white text-lg">Composição de Vegetação</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Vegetation Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vegetationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={{ strokeWidth: 0.5 }}
                >
                  {vegetationData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Proporção']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    padding: '6px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#333',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Metrics Summary */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dominante</h4>
              <p className="text-base font-semibold text-gray-800 dark:text-white">{dominantVegetation?.name}</p>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {dominantVegetation?.value}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs text-gray-500 dark:text-gray-400 font-medium">Diversidade</h4>
              <p className="text-base font-semibold text-amber-500">{diversityScore}/10</p>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {vegetationTypes} espécies
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default VegetationComposition; 