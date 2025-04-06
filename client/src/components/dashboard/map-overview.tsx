import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Apiary } from "@shared/schema";
import { useTheme } from "@/contexts/theme-context";

interface MapOverviewProps {
  apiaries: Apiary[];
}

// Simplified version of MapOverview, without dynamic loading
const MapOverview: React.FC<MapOverviewProps> = ({ apiaries }) => {
  const { isDarkMode } = useTheme();
  const mapInitialized = useRef(false);

  // Use static map image placeholder instead of interactive map
  const mapBg = isDarkMode 
    ? "bg-gray-800" 
    : "bg-amber-50";

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

      <div className={`relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-64 ${mapBg}`}>
        {/* Simple static map representation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3">
            {apiaries.map((apiary) => {
              // Determine marker color based on apiary ID for demonstration
              let bgColor = "bg-green-500";
              if (apiary.id === 2) {
                bgColor = "bg-amber-500";
              } else if (apiary.id === 3) {
                bgColor = "bg-red-500";
              }
              
              return (
                <div key={apiary.id} className="text-center">
                  <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white`}>
                    <span className="text-white text-xs font-bold">{apiary.id}</span>
                  </div>
                  <span className="text-xs font-medium block text-gray-700 dark:text-gray-300">{apiary.name}</span>
                </div>
              );
            })}
          </div>
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
