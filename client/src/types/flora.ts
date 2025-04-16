/**
 * Types for flora data and analysis
 */

export interface HealthMetrics {
  unhealthy: number;
  moderate: number;
  healthy: number;
  very_healthy: number;
  exceptional: number;
  average_ndvi: number;
}

export interface FloweringStage {
  stage: string;
  flowering_percent: number;
}

export interface FloweringInfo {
  season: string;
  species_stage: {
    [key: string]: FloweringStage;
  };
}

export interface FloraDistribution {
  rosemary: number;
  heather: number;
  eucalyptus: number;
  other: number;
}

export interface AnalysisResult {
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

export interface VegetationHeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

export interface VegetationHeatmapData {
  heatmap_points: VegetationHeatmapPoint[];
} 