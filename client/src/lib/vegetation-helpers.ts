import { AnalysisResult, VegetationHeatmapPoint } from '@/types/flora';

/**
 * Prepares vegetation data for heatmap visualization from analysis results
 */
export const prepareVegetationHeatmapData = async (data: AnalysisResult) => {
  // Esta função converte os dados de análise para pontos do heatmap
  // Em uma implementação real, estes dados viriam do backend
  
  // Array para armazenar os pontos do heatmap
  const heatmapPoints: VegetationHeatmapPoint[] = [];
  
  // Obter o centro da área
  const coordinates = data.metadata.coordinates;
  let centerLat = 0;
  let centerLng = 0;
  
  // Calcular o centro aproximado usando a média das coordenadas
  coordinates.forEach((coord: number[]) => {
    centerLat += coord[0];
    centerLng += coord[1];
  });
  centerLat /= coordinates.length;
  centerLng /= coordinates.length;
  
  // Gerar pontos aleatórios dentro e ao redor da área
  // A intensidade é baseada na distribuição de rosmaninho na análise
  const rosmarinhoPercentage = data.analysis.flora_distribution.rosemary / 100;
  
  // Número de pontos baseado no tamanho da área
  const numPoints = Math.floor(data.area_hectares * 5); // 5 pontos por hectare
  
  // Raio máximo em graus (aproximadamente 1km)
  const maxRadius = 0.01;
  
  for (let i = 0; i < numPoints; i++) {
    // Gerar um ponto aleatório dentro do raio
    const radius = Math.random() * maxRadius;
    const angle = Math.random() * Math.PI * 2;
    
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);
    
    // Intensidade baseada na porcentagem de rosmaninho e distância do centro
    // Quanto mais próximo do centro, maior a intensidade
    const distanceFactor = 1 - (radius / maxRadius);
    const baseIntensity = rosmarinhoPercentage * distanceFactor;
    
    // Adicionar alguma variação
    const intensity = baseIntensity * (0.7 + Math.random() * 0.6);
    
    heatmapPoints.push({
      latitude: lat,
      longitude: lng,
      intensity: intensity
    });
  }
  
  return heatmapPoints;
}; 