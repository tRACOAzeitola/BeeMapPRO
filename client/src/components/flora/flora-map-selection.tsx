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

export default function FloraMapSelection() {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const featGroupRef = useRef<L.FeatureGroup | null>(null);
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedArea, setSelectedArea] = useState<{ type: string; coordinates: any } | null>(null);
  const [activeTab, setActiveTab] = useState("map");

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
  const startAnalysis = () => {
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
    
    // Simulação do progresso
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return next;
      });
    }, 400);
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
                      edit={{ 
                        featureGroup: featGroupRef.current
                      }}
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
                    Analisando presença de rosmaninho na área selecionada...
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
            ) : analysisProgress === 100 ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center space-x-2">
                    <Flower2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium text-green-800 dark:text-green-400">Detecção Concluída</h3>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Área Total Analisada</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        238.5 hectares
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Presença de Rosmaninho</h4>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        42.8 hectares (18%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribuição da Vegetação</h4>
                      <div className="mt-2 h-8 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div className="flex h-full">
                          <div 
                            className="bg-amber-500 h-full" 
                            style={{ width: '18%' }}
                            title="Rosmaninho: 18%"
                          ></div>
                          <div 
                            className="bg-green-600 h-full" 
                            style={{ width: '35%' }}
                            title="Floresta: 35%"
                          ></div>
                          <div 
                            className="bg-green-400 h-full" 
                            style={{ width: '25%' }}
                            title="Vegetação rasteira: 25%"
                          ></div>
                          <div 
                            className="bg-gray-400 h-full" 
                            style={{ width: '22%' }}
                            title="Outros: 22%"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">Rosmaninho</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-600 rounded-sm mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">Floresta</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-400 rounded-sm mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">Rasteira</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-400 rounded-sm mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">Outros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
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