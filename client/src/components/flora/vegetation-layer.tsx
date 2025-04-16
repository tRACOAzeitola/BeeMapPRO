import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface VegetationLayerProps {
  data?: {
    heatmap_points?: Array<{
      latitude: number;
      longitude: number;
      intensity?: number;
    }>;
  };
  mapInstance?: L.Map;
}

// Define the L.heatLayer type
declare global {
  namespace L {
    function heatLayer(latlngs: any[], options?: any): any;
    namespace control {
      function attribution(options?: any): any;
      function layers(baseLayers?: any, overlays?: any, options?: any): any;
      function scale(options?: any): any;
      function zoom(options?: any): any;
    }
    function control(options?: any): any;
  }
}

export const VegetationLayer: React.FC<VegetationLayerProps> = ({ data, mapInstance }) => {
  const map = useMap() || mapInstance;
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);

  useEffect(() => {
    // Log para debug
    console.log('VegetationLayer montado com dados:', data);
    
    if (!map) {
      console.error('Mapa não disponível');
      return;
    }
    
    if (!data || !data.heatmap_points) {
      console.error('Dados de heatmap não disponíveis:', data);
      return;
    }
    
    console.log('Pontos para heatmap:', data.heatmap_points.length);

    // Limpar camada existente
    if (heatmapLayer) {
      console.log('Removendo camada existente');
      map.removeLayer(heatmapLayer);
    }

    // Preparar pontos para o heatmap
    const points = data.heatmap_points.map(point => {
      // Verificar se temos coordenadas válidas
      if (point.latitude === undefined || point.longitude === undefined) {
        console.warn('Ponto inválido detectado:', point);
        return null;
      }
      
      // Cada ponto tem latitude, longitude e intensidade
      return [
        point.latitude,
        point.longitude, 
        point.intensity || 0.5 // A intensidade determina a "força" do ponto no heatmap, valor padrão se não existir
      ];
    }).filter(point => point !== null); // Filtrar pontos nulos ou inválidos

    // Verificar se temos pontos válidos para exibir
    if (points.length === 0) {
      console.warn('Nenhum ponto válido encontrado para exibir no heatmap');
      return;
    }
    
    console.log('Pontos válidos para heatmap:', points.length);

    // Configurações do heatmap - aumentando o raio e a intensidade
    const options = {
      radius: 35, // Aumentado para maior visibilidade
      blur: 20,   // Aumentado para bordas mais suaves
      maxZoom: 17,
      minOpacity: 0.3, // Garante uma opacidade mínima
      max: 1.0,   // Define o valor máximo para normalização
      gradient: {
        0.2: '#E6D4FF', // Roxo claro para baixa concentração
        0.4: '#C9A9FF', // Roxo médio-claro
        0.6: '#A87BFF', // Roxo médio
        0.8: '#8A4FFF', // Roxo médio-escuro
        1.0: '#6931E0'  // Roxo escuro para alta concentração
      }
    };

    try {
      // Criar nova camada de heatmap
      console.log('Criando nova camada de heatmap');
      const newHeatmapLayer = L.heatLayer(points, options);
      
      // Adicionar ao mapa
      console.log('Adicionando camada ao mapa');
      newHeatmapLayer.addTo(map);
      
      // Salvar referência
      setHeatmapLayer(newHeatmapLayer);
      
      // Adicionar legenda
      addLegend(map);
      
      console.log('Heatmap adicionado com sucesso');
    } catch (error) {
      console.error('Erro ao criar heatmap:', error);
    }

    // Limpar ao desmontar
    return () => {
      if (heatmapLayer && map) {
        map.removeLayer(heatmapLayer);
        
        // Remover legenda se existir
        const legendControl = document.querySelector('.info.legend');
        if (legendControl) {
          legendControl.remove();
        }
      }
    };
  }, [map, data, mapInstance]);

  // Função para adicionar legenda ao mapa
  const addLegend = (map: L.Map) => {
    // Remover legenda existente se houver
    const existingLegend = document.querySelector('.info.legend');
    if (existingLegend) {
      existingLegend.remove();
    }

    // Criar controle de legenda
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
      div.style.lineHeight = '1.8';
      
      const grades = [
        { color: '#E6D4FF', label: 'Baixa concentração' },
        { color: '#A87BFF', label: 'Média concentração' },
        { color: '#6931E0', label: 'Alta concentração' }
      ];

      div.innerHTML = '<h4 style="margin-top:0; margin-bottom:10px; font-size:14px;">Rosmaninho</h4>';
      
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += 
          '<div style="display:flex; align-items:center; margin-bottom:5px;">' +
            '<i style="background:' + grades[i].color + '; width:18px; height:18px; border-radius:50%; display:inline-block; margin-right:8px;"></i> ' +
            '<span style="font-size:12px;">' + grades[i].label + '</span>' +
          '</div>';
      }

      return div;
    };

    legend.addTo(map);
  };

  // Para debugging, renderizar um componente visível
  return (
    <div style={{ display: 'none' }}>
      {data && data.heatmap_points ? `Pontos de calor: ${data.heatmap_points.length}` : 'Sem dados'}
    </div>
  );
};

export default VegetationLayer; 