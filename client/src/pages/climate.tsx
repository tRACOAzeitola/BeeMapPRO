import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Apiary, type WeatherData } from "@shared/schema";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, ThermometerSun, Droplets, Clock, Calendar } from "lucide-react";

export default function Climate() {
  const { toast } = useToast();
  const [selectedApiaryId, setSelectedApiaryId] = useState<number | null>(null);

  // Fetch apiaries
  const { data: apiaries, isLoading: isLoadingApiaries } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Set the first apiary as selected when data loads
  useEffect(() => {
    if (apiaries && apiaries.length > 0 && !selectedApiaryId) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, selectedApiaryId]);

  // Fetch weather data for selected apiary
  const { data: weatherData, isLoading: isLoadingWeather } = useQuery<WeatherData>({
    queryKey: ['/api/weather', selectedApiaryId],
    queryFn: async () => {
      if (!selectedApiaryId) return null;
      const res = await fetch(`/api/weather/${selectedApiaryId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json();
    },
    enabled: !!selectedApiaryId,
  });

  // Fetch weather history
  const { data: weatherHistory } = useQuery<WeatherData[]>({
    queryKey: ['/api/weather/history', selectedApiaryId],
    queryFn: async () => {
      if (!selectedApiaryId) return [];
      const res = await fetch(`/api/weather/${selectedApiaryId}/history`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch weather history');
      return res.json();
    },
    enabled: !!selectedApiaryId,
  });

  // Helper function to get weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    switch (conditions.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="text-amber-400 w-16 h-16" />;
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="text-gray-400 w-16 h-16" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="text-blue-400 w-16 h-16" />;
      case 'snow':
        return <CloudSnow className="text-blue-200 w-16 h-16" />;
      default:
        return <Cloud className="text-gray-400 w-16 h-16" />;
    }
  };

  // Helper function to get the appropriate icon for forecast
  const getForecastIcon = (conditions: string) => {
    switch (conditions.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="text-amber-400 w-8 h-8" />;
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="text-gray-400 w-8 h-8" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="text-blue-400 w-8 h-8" />;
      case 'snow':
        return <CloudSnow className="text-blue-200 w-8 h-8" />;
      default:
        return <Cloud className="text-gray-400 w-8 h-8" />;
    }
  };

  const getSelectedApiaryName = () => {
    if (!selectedApiaryId || !apiaries) return 'Selecione um apiário';
    const apiary = apiaries.find(a => a.id === selectedApiaryId);
    return apiary ? apiary.name : 'Apiário desconhecido';
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clima</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitore as condições climáticas atuais e previsões para seus apiários
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Apiário:</span>
          <Select
            value={selectedApiaryId?.toString() || ""}
            onValueChange={(value) => setSelectedApiaryId(parseInt(value))}
            disabled={isLoadingApiaries}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um apiário" />
            </SelectTrigger>
            <SelectContent>
              {apiaries?.map((apiary) => (
                <SelectItem key={apiary.id} value={apiary.id.toString()}>
                  {apiary.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingWeather || !weatherData ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center">
              {isLoadingWeather ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <p className="text-muted-foreground">
                  Selecione um apiário para ver informações climáticas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Current Weather Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Clima Atual</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {new Date(weatherData.date).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{getSelectedApiaryName()}</h3>
                  <p className="text-muted-foreground text-sm">{weatherData.conditions}</p>
                </div>
                {getWeatherIcon(weatherData.conditions)}
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 flex items-center space-x-3">
                  <ThermometerSun className="text-primary w-8 h-8" />
                  <div>
                    <p className="text-sm text-muted-foreground">Temperatura</p>
                    <p className="text-xl font-semibold">{weatherData.temperature}°C</p>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 rounded-lg p-4 flex items-center space-x-3">
                  <Droplets className="text-blue-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-muted-foreground">Humidade</p>
                    <p className="text-xl font-semibold">{weatherData.humidity}%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Condições para Apicultura</h4>
                {weatherData.isGoodForInspection ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-green-500 mr-2">✓</div>
                      <p className="font-medium">Condições ótimas para inspeção</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temperatura acima de 20°C, sem previsão de chuva.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-amber-500 mr-2">!</div>
                      <p className="font-medium">Condições não ideais para inspeção</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temperatura ou condições climáticas desfavoráveis.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Forecast Card */}
          <Card>
            <CardHeader>
              <CardTitle>Previsão para Próximos Dias</CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData.forecast && weatherData.forecast.days ? (
                <div className="grid grid-cols-3 gap-4">
                  {weatherData.forecast.days.map((day, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium mb-2">{day.day}</p>
                      <div className="flex justify-center mb-2">
                        {getForecastIcon(day.conditions)}
                      </div>
                      <p className="text-xl font-semibold">{day.temperature}°C</p>
                      <p className="text-xs text-muted-foreground mt-1">{day.conditions}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  Dados de previsão não disponíveis
                </p>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Dicas para Apicultores</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Evite inspecionar colmeias em dias chuvosos ou com temperaturas abaixo de 15°C.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>O melhor horário para inspeções é entre 10h e 15h, quando há maior atividade das abelhas.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Em dias muito quentes (acima de 30°C), observe se há necessidade de sombreamento adicional.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Weather History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Histórico Climático</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherHistory && weatherHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">Data</th>
                        <th className="text-left py-2 px-4 font-medium">Temperatura</th>
                        <th className="text-left py-2 px-4 font-medium">Humidade</th>
                        <th className="text-left py-2 px-4 font-medium">Condições</th>
                        <th className="text-left py-2 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weatherHistory.map((record, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-3 px-4">
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">{record.temperature}°C</td>
                          <td className="py-3 px-4">{record.humidity}%</td>
                          <td className="py-3 px-4">{record.conditions}</td>
                          <td className="py-3 px-4">
                            {record.isGoodForInspection ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/20 dark:text-green-400">
                                Favorável
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full dark:bg-amber-900/20 dark:text-amber-400">
                                Desfavorável
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ainda não há dados históricos disponíveis</p>
                  <p className="text-sm mt-2">
                    Os dados climáticos serão registrados conforme você utiliza o sistema
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
