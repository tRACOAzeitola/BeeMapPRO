import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { useToast } from "@/components/ui/toast-provider";
import { InfoIcon, AlertTriangle, Flower2, Search, Map as MapIcon, Trash2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Importar o EditControl usando importação ES6
// @ts-ignore
import { EditControl } from "react-leaflet-draw";

// Fix para os ícones do Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Centro do mapa padrão para Portugal
const DEFAULT_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 7;

// Adicionar interfaces para os dados retornados pela API
interface HealthMetrics {
  unhealthy: number;
  moderate: number;
  healthy: number;
  very_healthy: number;
  exceptional: number;
  average_ndvi: number;
}

interface FloweringStage {
  stage: string;
  flowering_percent: number;
}

interface FloweringInfo {
  season: string;
  species_stage: {
    [key: string]: FloweringStage;
  };
}

interface FloraDistribution {
  rosemary: number;
  heather: number;
  eucalyptus: number;
  other: number;
}

interface AnalysisResult {
  success: boolean;
  area_hectares: number;
  prediction_image: string;
  report_image: string;
  analysis: {
    overall_score: number;
    beekeeping_suitability: number;
    water_availability: number;
    climate_suitability: number;
    nectar_potential: number;
    health_metrics: HealthMetrics;
    flora_distribution: FloraDistribution;
    flowering_info: FloweringInfo;
  };
  metadata: {
    date_analyzed: string;
    coordinates: number[][];
    type: string;
  };
}

// Importações adicionais para tipagem
import type { FeatureGroup as FeatureGroupType } from "leaflet";

export default function FloraMapSelection() {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const featGroupRef = useRef<FeatureGroupType | null>(null);
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedArea, setSelectedArea] = useState<{ type: string; coordinates: any } | null>(null);
  const [activeTab, setActiveTab] = useState("map");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Setup dos ícones do Leaflet
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);

  // Lidar com a criação de uma forma no mapa
  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    
    // Limpar formas anteriores
    if (featGroupRef.current) {
      const drawnItems = featGroupRef.current.getLayers();
      if (drawnItems.length > 1) {
        // Remover todas as camadas, exceto a nova
        drawnItems.forEach((layer, index) => {
          if (layer !== e.layer) {
            featGroupRef.current?.removeLayer(layer);
          }
        });
      }
    }
    
    // Obter as coordenadas da forma desenhada
    if (layerType === 'polygon') {
      const coordinates = layer.getLatLngs()[0].map((point: L.LatLng) => [point.lat, point.lng]);
      setSelectedArea({ type: 'polygon', coordinates });
      toast({
        title: "Polígono selecionado",
        description: `Área selecionada com ${coordinates.length} pontos`,
      });
    } else if (layerType === 'rectangle') {
      const bounds = layer.getBounds();
      const coordinates = [
        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
        [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
      ];
      setSelectedArea({ type: 'rectangle', coordinates });
      toast({
        title: "Retângulo selecionado",
        description: "Área retangular selecionada no mapa",
      });
    } else {
      // Caso o tipo não seja reconhecido, assume como polígono genérico
      const coordinates = layer.getLatLngs()[0].map((point: L.LatLng) => [point.lat, point.lng]);
      setSelectedArea({ type: 'polygon', coordinates });
      toast({
        title: "Área selecionada",
        description: `Área genérica selecionada com ${coordinates.length} pontos`,
      });
    }
  };

  // Lidar com a exclusão de uma forma
  const handleDeleted = () => {
    setSelectedArea(null);
    toast({
      title: "Área removida",
      description: "A seleção de área foi removida",
    });
  };

  // Iniciar a análise de flora na área selecionada
  const startAnalysis = async () => {
    if (!selectedArea) {
      toast({
        title: "Nenhuma área selecionada",
        description: "Por favor, desenhe uma área no mapa para analisar",
        variant: "error",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab("results");
    setAnalysisResult(null); // Limpar análise anterior
    
    try {
      // Preparar os dados para enviar ao backend
      const areaData = {
        type: selectedArea.type || 'polygon', // Garante que type sempre tenha um valor
        coordinates: selectedArea.coordinates,
        date: new Date().toISOString().slice(0, 10) // Data atual no formato YYYY-MM-DD
      };
      
      console.log("Enviando dados para API:", JSON.stringify(areaData));
      
      // Iniciar o envio da requisição
      // Usando URL absoluta para garantir que está fazendo a chamada correta
      const response = await fetch('/api/flora/analyze-area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(areaData)
      });
      
      // Simulação do progresso enquanto o backend processa
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const next = prev + 5;
          return next < 95 ? next : prev; // Não chega a 100% até confirmar resposta
        });
      }, 1000);
      
      // Processar a resposta
      if (response.ok) {
        const data: AnalysisResult = await response.json();
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setIsAnalyzing(false);
        setAnalysisResult(data);
        
        toast({
          title: "Análise concluída",
          description: `Área analisada com sucesso: ${data.area_hectares.toFixed(1)} hectares`,
          variant: "success",
        });
      } else {
        // Tratar erro
        let errorMessage = "Ocorreu um erro ao analisar a área";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }
        
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        
        toast({
          title: "Erro na análise",
          description: errorMessage,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Erro ao analisar área:", error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao comunicar com o servidor. Verifique o console para mais detalhes.",
        variant: "error",
      });
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 dark:text-white">
              Análise de Flora por Área Geográfica
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Selecione uma área no mapa para analisar a presença de rosmaninho
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="map">Seleção de Área</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800/30 mb-4">
              <div className="flex items-start">
                <InfoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Instruções</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Use as ferramentas de desenho para selecionar uma área no mapa.
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                    <li className="flex items-center">
                      <span className="font-medium mr-1">Desenhe um polígono</span> ▢ para demarcar a área que deseja analisar.
                    </li>
                    <li className="flex items-center">
                      <span className="font-medium mr-1">Ou desenhe um retângulo</span> □ para uma seleção mais rápida.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[500px] relative">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                ref={(map) => { if (map) mapRef.current = map; }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={isDarkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />
                
                <FeatureGroup
                  ref={(featureGroup) => {
                    if (featureGroup) {
                      featGroupRef.current = featureGroup;
                    }
                  }}
                >
                  {typeof EditControl !== 'undefined' && (
                    <EditControl
                      position="topright"
                      onCreated={handleCreated}
                      onDeleted={handleDeleted}
                      draw={{
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                        polygon: {
                          allowIntersection: false,
                          drawError: {
                            color: '#e1e0e0',
                            message: '<strong>Erro:</strong> Você não pode desenhar polígonos que se cruzam!'
                          },
                          shapeOptions: {
                            color: '#f59e0b',
                            fillOpacity: 0.2
                          }
                        },
                        rectangle: {
                          shapeOptions: {
                            color: '#f59e0b',
                            fillOpacity: 0.2
                          }
                        }
                      }}
                      edit={{}}
                    />
                  )}
                </FeatureGroup>
              </MapContainer>
              
              {/* Legenda */}
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-md shadow p-2 z-[1000]">
                <div className="flex items-center text-xs space-x-2">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-gray-700 dark:text-gray-300">Buscar local</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {isAnalyzing ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Processando</AlertTitle>
                  <AlertDescription>
                    Analisando presença de flora melífera na área selecionada...
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progresso da análise</span>
                    <span className="text-sm font-medium">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              </div>
            ) : analysisProgress === 100 && analysisResult ? (
              <div className="space-y-8">
                {/* Resumo da Análise */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flower2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-medium text-green-800 dark:text-green-400">Análise Concluída</h3>
                    </div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center">
                      <span>Pontuação: {analysisResult.analysis.overall_score}/100</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Área Analisada</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {analysisResult.area_hectares.toFixed(1)} hectares
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Adequação Apícola</h4>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {analysisResult.analysis.beekeeping_suitability}%
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Potencial de Néctar</h4>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {analysisResult.analysis.nectar_potential}%
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Clima & Água</h4>
                      <div className="flex space-x-2 mt-1">
                        <span className="text-blue-500 dark:text-blue-400 font-bold text-sm">
                          Água: {analysisResult.analysis.water_availability}%
                        </span>
                        <span className="text-yellow-500 dark:text-yellow-400 font-bold text-sm">
                          Clima: {analysisResult.analysis.climate_suitability}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Imagens de Análise */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualização da Análise</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
                        <img 
                          src={`data:image/png;base64,${analysisResult.prediction_image}`} 
                          alt="Análise de flora" 
                          className="w-full h-auto object-contain rounded"
                        />
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                          Visualização de Índices de Vegetação
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
                        <img 
                          src={`data:image/png;base64,${analysisResult.report_image}`} 
                          alt="Relatório detalhado" 
                          className="w-full h-auto object-contain rounded"
                        />
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                          Relatório Detalhado da Análise
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distribuição de Flora */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Distribuição da Flora Melífera</h4>
                    <div className="h-8 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div className="flex h-full">
                        <div 
                          className="bg-amber-500 h-full" 
                          style={{ width: `${analysisResult.analysis.flora_distribution.rosemary.toFixed(1)}%` }}
                          title={`Rosmaninho: ${analysisResult.analysis.flora_distribution.rosemary.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${analysisResult.analysis.flora_distribution.heather.toFixed(1)}%` }}
                          title={`Urze: ${analysisResult.analysis.flora_distribution.heather.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${analysisResult.analysis.flora_distribution.eucalyptus.toFixed(1)}%` }}
                          title={`Eucalipto: ${analysisResult.analysis.flora_distribution.eucalyptus.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-gray-400 h-full" 
                          style={{ width: `${analysisResult.analysis.flora_distribution.other.toFixed(1)}%` }}
                          title={`Outras: ${analysisResult.analysis.flora_distribution.other.toFixed(1)}%`}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></span>
                        <span className="text-gray-600 dark:text-gray-400">Rosmaninho</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-purple-500 rounded-sm mr-1"></span>
                        <span className="text-gray-600 dark:text-gray-400">Urze</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span>
                        <span className="text-gray-600 dark:text-gray-400">Eucalipto</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-gray-400 rounded-sm mr-1"></span>
                        <span className="text-gray-600 dark:text-gray-400">Outras</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botão para voltar ao mapa */}
                <div className="text-center">
                  <Button onClick={() => setActiveTab("map")} className="space-x-2">
                    <MapIcon className="h-4 w-4" />
                    <span>Voltar ao Mapa</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Selecione uma área no mapa e inicie a análise para ver os resultados.
                </p>
                <Button onClick={() => setActiveTab("map")} variant="outline">
                  Ir para o Mapa
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedArea 
            ? `Área selecionada: ${selectedArea.type === 'polygon' ? 'Polígono' : 'Retângulo'} com ${selectedArea.coordinates.length} pontos`
            : 'Nenhuma área selecionada'}
        </div>
        <Button 
          onClick={startAnalysis} 
          disabled={!selectedArea || isAnalyzing}
          className="space-x-2"
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Analisando...</span>
            </>
          ) : (
            <>
              <Flower2 className="h-4 w-4" />
              <span>Analisar Área</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 