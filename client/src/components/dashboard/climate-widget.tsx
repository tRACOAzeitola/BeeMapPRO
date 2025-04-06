import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, Sun, Check, RefreshCw } from "lucide-react";
import { fetchWeatherForLocation } from "@/lib/weather-service";

const ClimateWidget: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In a real application, we'd fetch the most active apiary's weather data
  // For now, we'll use a default location (Coimbra, Portugal)
  const { data: weather, refetch, isFetching } = useQuery({
    queryKey: ['/api/weather', 1], // Default to apiary ID 1
    queryFn: () => fetchWeatherForLocation("40.2033, -8.4103"),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    switch (conditions?.toLowerCase()) {
      case "clear":
      case "sunny":
        return <Sun className="text-amber-400 w-12 h-12" />;
      case "clouds":
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="text-gray-400 w-12 h-12" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="text-blue-400 w-12 h-12" />;
      default:
        return <Sun className="text-amber-400 w-12 h-12" />;
    }
  };

  // Get forecast icon
  const getForecastIcon = (conditions: string) => {
    switch (conditions?.toLowerCase()) {
      case "clear":
      case "sunny":
        return <Sun className="text-amber-400 w-6 h-6" />;
      case "clouds":
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="text-gray-400 w-6 h-6" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="text-blue-400 w-6 h-6" />;
      default:
        return <Sun className="text-amber-400 w-6 h-6" />;
    }
  };

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 dark:text-white">Clima</h3>
        <button 
          onClick={handleRefresh}
          disabled={isFetching}
          className="text-xs text-amber-500 dark:text-amber-400 hover:underline flex items-center"
        >
          Atualizar <RefreshCw className={`ml-1 w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isFetching && !weather ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Current Weather Widget */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coimbra, Portugal</p>
                <h4 className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
                  {weather?.temperature || 24}°C
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {weather?.conditions || "Ensolarado"}, {weather?.humidity || 30}% humidade
                </p>
              </div>
              <div className="text-5xl">
                {getWeatherIcon(weather?.conditions || "Sunny")}
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <h4 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Próximos Dias
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {weather?.forecast && Array.isArray(weather.forecast.days) ? (
              weather.forecast.days.map((day: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{day.day}</p>
                  <div className="text-amber-400 my-1 flex justify-center">
                    {getForecastIcon(day.conditions)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{day.temperature}°C</p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qua</p>
                  <div className="flex justify-center my-1">{getForecastIcon("Partly Cloudy")}</div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">22°C</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qui</p>
                  <div className="flex justify-center my-1">{getForecastIcon("Sunny")}</div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">25°C</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sex</p>
                  <div className="flex justify-center my-1">{getForecastIcon("Rain")}</div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">19°C</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Condições para Apicultura
            </h4>
            <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
              <div className="flex items-center">
                <div className="text-green-500 mr-2"><Check className="w-4 h-4" /></div>
                <p className="text-sm text-gray-800 dark:text-white">Condições ótimas para inspeção</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Temperatura acima de 20°C, sem previsão de chuva.
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default ClimateWidget;
