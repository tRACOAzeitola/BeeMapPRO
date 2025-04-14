import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Apiary } from "@shared/schema";
import { useTheme } from "@/contexts/theme-context";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para os ícones do Leaflet que normalmente não funcionam com bundlers
// Solução baseada na documentação oficial
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Resolução do problema de ícones padrão do Leaflet
// Isto precisa estar dentro do componente

interface MapOverviewProps {
  apiaries: Apiary[];
}

// Centro do mapa padrão para Portugal
const DEFAULT_CENTER: [number, number] = [39.5, -8.0]; // Coordenadas aproximadas do centro de Portugal
const DEFAULT_ZOOM = 7;

// Cores para os marcadores baseadas no status
const getMarkerIcon = (status: string) => {
  let color = "#4ade80"; // verde para status bom
  
  if (status === "warning") {
    color = "#f59e0b"; // amarelo para atenção
  } else if (status === "critical") {
    color = "#ef4444"; // vermelho para crítico
  }
  
  return L.divIcon({
    className: "custom-marker-icon",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <span style="color: white; font-weight: bold; font-size: 12px;"></span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapOverview: React.FC<MapOverviewProps> = ({ apiaries }) => {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  
  // Setup dos ícones do Leaflet
  useEffect(() => {
    // Solução segura com type casting para evitar erros de TypeScript
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);
  
  // Determinar status simulado para apiários
  const getApiaryStatus = (apiaryId: number) => {
    if (apiaryId === 2) return "warning";
    if (apiaryId === 3) return "critical";
    return "good";
  };
  
  // Simulação de coordenadas para os apiários
  const getApiaryCoordinates = (apiaryId: number): [number, number] => {
    // Coordenadas simuladas ao redor de Portugal
    const baseCoords: [number, number] = [39.5, -8.0];
    
    // Adiciona pequenas variações para que os marcadores não fiquem sobrepostos
    return [
      baseCoords[0] + (apiaryId * 0.5 - 1),
      baseCoords[1] + (apiaryId * 0.3 - 0.5)
    ];
  };

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 dark:text-white">Mapa de Apiários</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filtrar
          </Button>
          <Button size="sm" className="h-8 px-3 text-xs">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Expandir
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-64 relative">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          
          {apiaries.map((apiary) => {
            const status = getApiaryStatus(apiary.id);
            const coordinates = getApiaryCoordinates(apiary.id);
            
            return (
              <Marker 
                key={apiary.id}
                position={coordinates}
                icon={getMarkerIcon(status)}
              >
                <Popup>
                  <div className="text-sm">
                    <b>{apiary.name}</b><br />
                    Colmeias: {apiary.id * 3 + 5}<br />
                    Status: {status}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Legenda */}
        <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 rounded-md shadow p-2 z-[1000]">
          <div className="flex items-center text-xs space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              <span className="text-gray-700 dark:text-gray-300">Bom</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
              <span className="text-gray-700 dark:text-gray-300">Atenção</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
              <span className="text-gray-700 dark:text-gray-300">Crítico</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span className="italic">Última atualização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <a href="/apiaries" className="text-amber-500 dark:text-amber-400 hover:underline flex items-center">
          Ver mapa completo <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </Card>
  );
};

export default MapOverview;
