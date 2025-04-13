import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import { Map, Satellite, Thermometer, Wind } from 'lucide-react';

const GeospatialData: React.FC = () => {
  const { isDarkMode } = useTheme();

  const dataLayers = [
    {
      icon: <Map className="w-6 h-6" />,
      title: 'Topografia',
      description: 'Análise detalhada do relevo e características do terreno',
      active: true
    },
    {
      icon: <Satellite className="w-6 h-6" />,
      title: 'Cobertura Vegetal',
      description: 'Mapeamento da vegetação e áreas de flora melífera',
      active: true
    },
    {
      icon: <Thermometer className="w-6 h-6" />,
      title: 'Temperatura',
      description: 'Variações de temperatura e zonas térmicas',
      active: false
    },
    {
      icon: <Wind className="w-6 h-6" />,
      title: 'Ventos',
      description: 'Direção e intensidade dos ventos predominantes',
      active: false
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dados Geoespaciais
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Análise avançada de dados geográficos e ambientais
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Principal */}
        <div className={`lg:col-span-2 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Visualização do Terreno
          </h2>
          <div className={`aspect-video rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Mapa Interativo
              <br />
              (Em desenvolvimento)
            </p>
          </div>
        </div>

        {/* Camadas de Dados */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Camadas de Dados
          </h2>
          <div className="space-y-4">
            {dataLayers.map((layer, index) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? layer.active ? 'bg-gray-700 border-amber-500/30' : 'bg-gray-900 border-gray-700'
                    : layer.active ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${layer.active ? 'text-amber-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {layer.icon}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      isDarkMode 
                        ? layer.active ? 'text-amber-400' : 'text-gray-300'
                        : layer.active ? 'text-amber-700' : 'text-gray-700'
                    }`}>
                      {layer.title}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {layer.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className={`lg:col-span-3 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Estatísticas da Área
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Área Total Mapeada</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,250 ha</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pontos de Interesse</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>47</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Altitude Média</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>450 m</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Densidade Flora</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>75%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeospatialData; 