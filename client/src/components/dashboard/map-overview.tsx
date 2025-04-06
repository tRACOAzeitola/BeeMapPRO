import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PlusIcon, MinusIcon, Navigation, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Apiary } from "@shared/schema";
import { useTheme } from "@/contexts/theme-context";

interface MapOverviewProps {
  apiaries: Apiary[];
}

const MapOverview: React.FC<MapOverviewProps> = ({ apiaries }) => {
  const { isDarkMode } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Initialize leaflet map
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapLoaded) {
      // Dynamically import leaflet
      import('leaflet').then((L) => {
        // Import CSS
        import('leaflet/dist/leaflet.css');

        // Create map instance if not created
        if (!map) {
          // Center on Portugal
          const initialMap = L.map('map-overview', {
            center: [39.6, -8.0],
            zoom: 7,
            zoomControl: false,
          });

          // Add tile layer
          const tileLayer = isDarkMode
            ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
              })
            : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
              });

          tileLayer.addTo(initialMap);
          setMap(initialMap);
          setMapLoaded(true);
        }
      });
    }
  }, [isDarkMode, map, mapLoaded]);

  // Update markers when apiaries change
  useEffect(() => {
    if (map && apiaries.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      
      const newMarkers = apiaries.map(apiary => {
        // Extract coordinates from string format "lat, lng"
        const coords = apiary.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
          console.warn(`Invalid coordinates for apiary ${apiary.id}: ${apiary.coordinates}`);
          return null;
        }

        // Determine marker color based on hive status
        let statusColor = "#4CAF50"; // Default to green (good)
        
        // In a real implementation, we would fetch the status of hives for each apiary
        // For now we're using mock logic based on the apiary ID to match the design
        if (apiary.id === 2) {
          statusColor = "#FFC107"; // Warning/yellow for apiary 2
        } else if (apiary.id === 3) {
          statusColor = "#DC3545"; // Danger/red for apiary 3
        }

        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="background-color: ${statusColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Create marker
        const marker = L.marker([coords[0], coords[1]], { icon }).addTo(map);
        marker.bindPopup(`<b>${apiary.name}</b><br>${apiary.location}`);
        
        return marker;
      }).filter(Boolean);

      setMarkers(newMarkers as any);

      // Fit bounds to markers if we have any
      if (newMarkers.length > 0) {
        const group = L.featureGroup(newMarkers as any);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }
  }, [map, apiaries, markers]);

  // Update map when dark mode changes
  useEffect(() => {
    if (map) {
      // Remove existing tile layer
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      // Add new tile layer based on dark mode
      const tileLayer = isDarkMode
        ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          });
          
      tileLayer.addTo(map);
    }
  }, [isDarkMode, map]);

  // Zoom handlers
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map?.setView(
            [position.coords.latitude, position.coords.longitude],
            13
          );
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700">
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

      <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-64">
        <div id="map-overview" className="absolute inset-0"></div>
        
        {/* Map Controls */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 flex flex-col">
          <button 
            onClick={handleZoomIn} 
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-1"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-1"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={handleLocate} 
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-1"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 rounded-md shadow p-2">
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
