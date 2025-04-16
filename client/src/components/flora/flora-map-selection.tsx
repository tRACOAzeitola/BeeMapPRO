import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from "react-leaflet";
import { useToast } from "@/components/ui/toast-provider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { AnalysisResult, VegetationHeatmapData } from "@/types/flora";
import { prepareVegetationHeatmapData } from "@/lib/vegetation-helpers";

// Importações adicionais
// @ts-ignore
import { EditControl } from "react-leaflet-draw";
import SearchControl from "./search-control";
import VegetationLayer from "./vegetation-layer";

// Fix para os ícones do Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Centro do mapa padrão para Portugal
const DEFAULT_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 7;

// Importações adicionais para tipagem
import type { FeatureGroup as FeatureGroupType, Layer } from "leaflet";

export default function FloraMapSelection() {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const featGroupRef = useRef<FeatureGroupType | null>(null);
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{ type: string; coordinates: any } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [vegetationData, setVegetationData] = useState<VegetationHeatmapData | null>(null);
  const [showVegetationLayer, setShowVegetationLayer] = useState(false);
  
  // Setup dos ícones do Leaflet
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);

  // Calcular métricas da área selecionada
  const [areaMetrics, setAreaMetrics] = useState<{area: number, perimeter: number}>({
    area: 0,
    perimeter: 0
  });
  
  // Lidar com a criação de uma forma no mapa
  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    
    // Limpar formas anteriores
    if (featGroupRef.current) {
      const drawnItems = featGroupRef.current.getLayers();
      if (drawnItems.length > 1) {
        // Remover todas as camadas, exceto a nova
        drawnItems.forEach((layer: Layer, index: number) => {
          if (layer !== e.layer) {
            featGroupRef.current?.removeLayer(layer);
          }
        });
      }
    }
    
    // Determinar o tipo de forma e definir um tipo padrão para evitar erros de tipo
    let areaType = 'polygon'; // valor padrão
    
    if (layerType === 'polygon') {
      areaType = 'polygon';
    } else if (layerType === 'rectangle') {
      areaType = 'rectangle';
    }
    
    // Obter as coordenadas da forma desenhada
    if (layerType === 'polygon') {
      const coordinates = layer.getLatLngs()[0].map((point: L.LatLng) => [point.lat, point.lng]);
      setSelectedArea({ type: areaType, coordinates });
      
      // Calcular tamanho e perímetro aproximados
      calculateAreaMetrics(layer);
      
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
      setSelectedArea({ type: areaType, coordinates });
      
      // Calcular tamanho e perímetro aproximados
      calculateAreaMetrics(layer);
      
      toast({
        title: "Retângulo selecionado",
        description: "Área retangular selecionada no mapa",
      });
    } else {
      // Se o tipo não for reconhecido, tenta extrair as coordenadas como polígono genérico
      try {
        const coordinates = layer.getLatLngs()[0].map((point: L.LatLng) => [point.lat, point.lng]);
        setSelectedArea({ type: areaType, coordinates });
        
        // Calcular tamanho e perímetro aproximados
        calculateAreaMetrics(layer);
        
        toast({
          title: "Área selecionada",
          description: `Área genérica selecionada com ${coordinates.length} pontos`,
        });
      } catch (error) {
        console.error("Erro ao extrair coordenadas:", error);
        toast({
          title: "Erro ao selecionar área",
          description: "Formato não suportado. Tente desenhar um polígono ou retângulo.",
          variant: "error",
        });
      }
    }
    
    // Resetar estados anteriores
    setShowVegetationLayer(false);
    setVegetationData(null);
    setAnalysisResult(null);
  };
  
  const calculateAreaMetrics = (layer: L.Layer) => {
    try {
      // Calcular área em metros quadrados
      const latLngs = (layer as any).getLatLngs?.[0] || [];
      if (!latLngs || latLngs.length === 0) {
        console.error("Não foi possível obter coordenadas da camada");
        return;
      }
      
      // @ts-ignore - Leaflet interno possui este método
      const areaInMeters = L.GeometryUtil.geodesicArea(latLngs);
      const areaInKm2 = areaInMeters / 1000000; // Converter para km²
      
      // Calcular perímetro
      let perimeter = 0;
      
      for (let i = 0; i < latLngs.length; i++) {
        const pointA = latLngs[i];
        const pointB = latLngs[(i + 1) % latLngs.length]; // Voltar ao início para fechar o polígono
        perimeter += pointA.distanceTo(pointB);
      }
      
      const perimeterInKm = perimeter / 1000; // Converter para km
      
      setAreaMetrics({
        area: parseFloat(areaInKm2.toFixed(2)),
        perimeter: parseFloat(perimeterInKm.toFixed(2))
      });
    } catch (error) {
      console.error("Erro ao calcular métricas da área:", error);
      setAreaMetrics({area: 0, perimeter: 0});
    }
  };

  // Lidar com a exclusão de uma forma
  const handleDeleted = () => {
    setSelectedArea(null);
    setAreaMetrics({area: 0, perimeter: 0});
    setShowVegetationLayer(false);
    setVegetationData(null);
    setAnalysisResult(null);
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
    setShowVegetationLayer(false);
    
    try {
      // Simulação de chamada à API
      // Em um ambiente real, esta seria uma chamada real ao backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar dados simulados para a demonstração
      const mockAnalysisResult: AnalysisResult = {
        success: true,
        area_hectares: areaMetrics.area * 100, // Converter km² para hectares
        prediction_image: "",  // Em um ambiente real, teria uma imagem codificada em base64
        report_image: "",      // Em um ambiente real, teria uma imagem codificada em base64
        analysis: {
          overall_score: 72,
          beekeeping_suitability: 82,
          water_availability: 70,
          climate_suitability: 80,
          nectar_potential: 75,
          health_metrics: {
            unhealthy: 5,
            moderate: 15,
            healthy: 40,
            very_healthy: 30,
            exceptional: 10,
            average_ndvi: 0.65
          },
          flora_distribution: {
            rosemary: 82,
            heather: 8,
            eucalyptus: 5,
            other: 5
          },
          flowering_info: {
            season: "primavera",
            species_stage: {
              rosemary: {
                stage: "floração plena",
                flowering_percent: 85
              }
            }
          }
        },
        metadata: {
          date_analyzed: new Date().toISOString(),
          coordinates: selectedArea.coordinates,
          type: selectedArea.type
        }
      };
      
      setAnalysisResult(mockAnalysisResult);
      setIsAnalyzing(false);
      
      toast({
        title: "Análise concluída",
        description: `Área analisada com sucesso: ${mockAnalysisResult.area_hectares.toFixed(1)} hectares`,
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao analisar área:", error);
      setIsAnalyzing(false);
      
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao comunicar com o servidor. Verifique o console para mais detalhes.",
        variant: "error",
      });
    }
  };
  
  // Função para detectar rosmaninho
  const detectRosmaninho = async () => {
    if (!selectedArea) {
      toast({
        title: "Nenhuma área selecionada",
        description: "Por favor, desenhe uma área no mapa para detectar rosmaninho",
        variant: "error",
      });
      return;
    }
    
    setIsDetecting(true);
    
    try {
      // Simulação de chamada à API para detecção de rosmaninho
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Gerar dados simulados para o heatmap
      const mockDistribution = analysisResult?.analysis.flora_distribution.rosemary || 85;
      
      // Preparar dados do heatmap
      const mockAnalysis = {
        analysis: {
          overall_score: 72,
          beekeeping_suitability: 82,
          water_availability: 70,
          climate_suitability: 80,
          nectar_potential: 75,
          health_metrics: {
            unhealthy: 5,
            moderate: 15,
            healthy: 40,
            very_healthy: 30,
            exceptional: 10,
            average_ndvi: 0.65
          },
          flora_distribution: {
            rosemary: mockDistribution,
            heather: 5,
            eucalyptus: 5,
            other: 5
          },
          flowering_info: {
            season: "primavera",
            species_stage: {
              rosemary: {
                stage: "floração plena",
                flowering_percent: 85
              }
            }
          }
        },
        area_hectares: areaMetrics.area * 100,
        metadata: {
          coordinates: selectedArea.coordinates,
          date_analyzed: new Date().toISOString(),
          type: selectedArea.type
        },
        success: true,
        prediction_image: "",
        report_image: ""
      };
      
      const heatmapData = await prepareVegetationHeatmapData(mockAnalysis as AnalysisResult);
      
      setVegetationData({ heatmap_points: heatmapData });
      setShowVegetationLayer(true);
      setIsDetecting(false);
      
      toast({
        title: "Detecção concluída",
        description: `Concentração de rosmaninho mapeada com sucesso`,
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao detectar rosmaninho:", error);
      setIsDetecting(false);
      
      toast({
        title: "Erro na detecção",
        description: "Ocorreu um erro ao detectar rosmaninho. Verifique o console para mais detalhes.",
        variant: "error",
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm h-full">
          <CardContent className="p-0">
            <div className="h-[calc(100vh-150px)] relative">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                ref={(map) => { if (map) mapRef.current = map; }}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Mapa">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url={isDarkMode 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      }
                    />
                  </LayersControl.BaseLayer>
                  
                  <LayersControl.BaseLayer name="Satélite">
                    <TileLayer
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                <SearchControl />
                
                {showVegetationLayer && vegetationData && (
                  <VegetationLayer data={vegetationData} />
                )}
                
                <FeatureGroup
                  ref={(featureGroup) => {
                    if (featureGroup) {
                      featGroupRef.current = featureGroup;
                    }
                  }}
                >
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
                          color: '#3b82f6',
                          fillOpacity: 0.2
                        }
                      },
                      rectangle: {
                        shapeOptions: {
                          color: '#3b82f6',
                          fillOpacity: 0.2
                        }
                      }
                    }}
                    edit={{
                      remove: true
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Área Selecionada</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {selectedArea ? (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-2">Detalhes da Área</h3>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span>Tamanho:</span> 
                      <span className="font-medium">{areaMetrics.area} km²</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Perímetro:</span> 
                      <span className="font-medium">{areaMetrics.perimeter} km</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={startAnalysis} 
                    disabled={isAnalyzing || isDetecting}
                    className="w-full"
                  >
                    {isAnalyzing ? 'Analisando...' : 'Analisar Área'}
                  </Button>
                  
                  <Button 
                    onClick={detectRosmaninho} 
                    disabled={isAnalyzing || isDetecting}
                    className="w-full"
                    variant="secondary"
                  >
                    {isDetecting ? 'Detectando...' : 'Detectar Rosmaninho'}
                  </Button>
                </div>
                
                {analysisResult && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Análise do Potencial Apícola</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Vegetação Melífera:</span>
                        <span className="ml-auto font-medium">{analysisResult.analysis.beekeeping_suitability/10}/10</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Acesso à Água:</span>
                        <span className="ml-auto font-medium">{analysisResult.analysis.water_availability/10}/10</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Clima Favorável:</span>
                        <span className="ml-auto font-medium">{analysisResult.analysis.climate_suitability/10}/10</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Acessibilidade:</span>
                        <span className="ml-auto font-medium">6.0/10</span>
                      </li>
                      <li className="flex items-center font-medium">
                        <span className="mr-2">•</span>
                        <span>Pontuação Total:</span>
                        <span className="ml-auto">{analysisResult.analysis.overall_score/10}/10</span>
                      </li>
                    </ul>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Conclusão:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        A área possui grande potencial apícola, especialmente devido à alta concentração de vegetação melífera e condições climáticas favoráveis.
                      </p>
                    </div>
                  </div>
                )}
                
                {showVegetationLayer && vegetationData && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Dados da Vegetação: Rosmaninho</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span>Fonte dos Dados:</span>
                        <span>Sentinel-2 Imagery</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Data:</span>
                        <span>15/03/2023</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Resolução:</span>
                        <span>10m</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Confiança da Detecção:</span>
                        <span>87%</span>
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 rounded-full bg-[#6931E0]"></div>
                          <span className="text-xs mt-1">Alta</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 rounded-full bg-[#A87BFF]"></div>
                          <span className="text-xs mt-1">Média</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 rounded-full bg-[#E6D4FF]"></div>
                          <span className="text-xs mt-1">Baixa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Selecione uma área no mapa para ver detalhes e realizar análises.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}