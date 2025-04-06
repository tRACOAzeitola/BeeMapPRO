import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import { type Apiary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, PlusIcon, MinusIcon, Navigation, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ApiaryMapProps {
  apiaries: Apiary[];
}

const ApiaryMap: React.FC<ApiaryMapProps> = ({ apiaries }) => {
  const { isDarkMode } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
          const initialMap = L.map('apiary-map', {
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
          
          // Add layer control
          const baseMaps = {
            "OpenStreetMap": tileLayer,
            "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
              maxZoom: 19,
            })
          };
          
          L.control.layers(baseMaps, {}).addTo(initialMap);
          
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
            <div style="background-color: ${statusColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Create marker
        const marker = L.marker([coords[0], coords[1]], { icon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${apiary.name}</h3>
            <p>${apiary.location}</p>
            <p class="text-xs text-gray-500">Coordenadas: ${apiary.coordinates}</p>
            ${apiary.floraTypes?.length ? `<p class="mt-1"><strong>Flora:</strong> ${apiary.floraTypes.join(', ')}</p>` : ''}
          </div>
        `);
        
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

  // Handle search
  const handleSearch = () => {
    if (!searchQuery || !map) return;
    
    const filteredApiaries = apiaries.filter(apiary => 
      apiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apiary.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredApiaries.length > 0) {
      const firstMatch = filteredApiaries[0];
      const coords = firstMatch.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        map.setView([coords[0], coords[1]], 12);
        
        // Find and open popup for the first match
        markers.forEach(marker => {
          const latLng = marker.getLatLng();
          if (latLng.lat === coords[0] && latLng.lng === coords[1]) {
            marker.openPopup();
          }
        });
      }
    }
  };

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

  // Handle layers
  const handleToggleLayers = () => {
    // This would be implemented to toggle different map layers
    // For now, it's just a placeholder as we're using the built-in layer control
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 p-3 border-b dark:border-gray-700 flex justify-between">
        <div className="relative w-64">
          <Input
            placeholder="Procurar apiário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
          <Search 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleToggleLayers}>
            <Layers className="w-4 h-4 mr-1" /> Camadas
          </Button>
        </div>
      </div>
      
      <div className="relative flex-grow">
        <div id="apiary-map" className="absolute inset-0"></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 flex flex-col">
          <button 
            onClick={handleZoomIn}
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-2"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-2"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={handleLocate}
            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 p-2"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-md shadow-md p-3">
          <p className="text-xs font-semibold mb-2">Status dos Apiários</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Saudável</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Atenção</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Crítico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiaryMap;
