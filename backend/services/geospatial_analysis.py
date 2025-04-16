import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

from models.geospatial import (
    Coordinates, Area, GeospatialAnalysis, VegetationData, 
    WaterSource, ClimateData, LandCoverClass
)

class GeospatialService:
    """
    Serviço para realizar análise geoespacial de áreas para determinação
    de adequação à apicultura.
    """
    
    def __init__(self):
        # Em uma implementação real, aqui inicializaríamos conexões 
        # com serviços de dados geoespaciais, banco de dados espacial, etc.
        pass
    
    def calculate_area_centroid(self, points: List[Coordinates]) -> Coordinates:
        """Calcula o centróide de um conjunto de pontos"""
        latitudes = [p.latitude for p in points]
        longitudes = [p.longitude for p in points]
        return Coordinates(
            latitude=sum(latitudes) / len(latitudes),
            longitude=sum(longitudes) / len(longitudes)
        )
    
    def calculate_area_size(self, points: List[Coordinates]) -> float:
        """
        Calcula a área aproximada em quilômetros quadrados usando a fórmula de Haversine
        para uma aproximação de polígono em coordenadas geográficas
        """
        # Implementação simplificada - em um sistema real usaríamos GeoPandas ou PostGIS
        # para cálculos precisos de área
        return 12.5  # valor simulado em km²
    
    def get_vegetation_indices(self, area: Area) -> Dict[str, float]:
        """
        Recupera índices de vegetação para a área especificada
        Em um sistema real, consultaríamos APIs como Earth Engine ou imagens de satélite
        """
        # Valores simulados
        return {
            "ndvi": 0.68,  # 0-1, bom valor de vegetação
            "evi": 0.72,
            "lai": 3.5    # Índice de área foliar
        }
    
    def get_water_sources(self, area: Area) -> List[WaterSource]:
        """
        Identifica fontes de água na área e proximidades
        """
        # Dados simulados - em um sistema real usaríamos bases de dados hidrográficos
        center = area.center or self.calculate_area_centroid(area.points)
        
        return [
            WaterSource(
                coordinates=Coordinates(
                    latitude=center.latitude + 0.015,
                    longitude=center.longitude - 0.02
                ),
                type="river",
                seasonal=False,
                distance_from_center_km=1.2
            ),
            WaterSource(
                coordinates=Coordinates(
                    latitude=center.latitude - 0.01,
                    longitude=center.longitude + 0.01
                ),
                type="pond",
                seasonal=True,
                distance_from_center_km=0.8
            )
        ]
    
    def get_climate_data(self, area: Area) -> ClimateData:
        """
        Recupera dados climáticos para a área
        """
        # Dados simulados - em um sistema real consultaríamos APIs de clima
        return ClimateData(
            average_temperature=18.5,
            min_temperature=10.2,
            max_temperature=31.8,
            rainfall_mm_year=850,
            wind_speed_avg=12.3,
            humidity_avg=65.0,
            timestamp=datetime.now()
        )
    
    def get_land_cover(self, area: Area) -> Dict[LandCoverClass, float]:
        """
        Determina a cobertura do solo na área especificada
        Retorna percentagens para cada classe de cobertura
        """
        # Dados simulados - em um sistema real usaríamos classificação de imagens
        return {
            LandCoverClass.FOREST: 0.25,
            LandCoverClass.SHRUBLAND: 0.40,
            LandCoverClass.GRASSLAND: 0.20,
            LandCoverClass.CROPLAND: 0.10,
            LandCoverClass.URBAN: 0.02,
            LandCoverClass.WATER: 0.03,
            LandCoverClass.BARREN: 0.00
        }
    
    def get_elevation_data(self, area: Area) -> Tuple[Tuple[float, float], float, str]:
        """
        Recupera dados de elevação, inclinação e orientação predominante
        Retorna: (min_elevation, max_elevation), slope_avg, aspect
        """
        # Dados simulados - em um sistema real usaríamos modelos digitais de elevação
        return (320, 450), 15.2, "Sul"
    
    def analyze_area(self, area: Area) -> GeospatialAnalysis:
        """
        Realiza análise completa de uma área para adequação à apicultura
        """
        # Calcular centróide e área se não fornecidos
        if not area.center:
            area.center = self.calculate_area_centroid(area.points)
        
        if not area.area_km2:
            area.area_km2 = self.calculate_area_size(area.points)
        
        # Obter dados
        vegetation_indices = self.get_vegetation_indices(area)
        water_sources = self.get_water_sources(area)
        climate = self.get_climate_data(area)
        land_cover = self.get_land_cover(area)
        (elev_min, elev_max), slope_avg, aspect = self.get_elevation_data(area)
        
        # Calcular métricas específicas para apicultura
        # Em um sistema real, usaríamos modelos de ML treinados com dados apícolas
        
        # Percentagem de plantas em floração (baseado na época do ano, vegetação, etc)
        flowering_percent = 35.0  # valor simulado
        
        # Escore de proximidade de água (0-1, mais alto é melhor)
        water_proximity = self._calculate_water_proximity_score(water_sources)
        
        # Adequação do clima para abelhas (0-1)
        climate_suitability = self._calculate_climate_suitability(climate)
        
        # Pontuação geral de adequação apícola (0-100)
        overall_score = self._calculate_overall_suitability(
            vegetation_indices, water_proximity, climate_suitability, 
            land_cover, slope_avg
        )
        
        return GeospatialAnalysis(
            area=area,
            vegetation_indices=vegetation_indices,
            land_cover=land_cover,
            water_sources=water_sources,
            climate=climate,
            elevation_range=(elev_min, elev_max),
            slope_avg=slope_avg,
            aspect=aspect,
            timestamp=datetime.now(),
            flowering_plants_percentage=flowering_percent,
            water_proximity_score=water_proximity,
            climate_suitability_score=climate_suitability,
            overall_bee_suitability=overall_score
        )
    
    def _calculate_water_proximity_score(self, water_sources: List[WaterSource]) -> float:
        """Calcula pontuação de proximidade de água baseado nas fontes disponíveis"""
        if not water_sources:
            return 0.0
            
        # Simplifcado: pontuação baseada no recurso mais próximo
        min_distance = min(ws.distance_from_center_km or 100 for ws in water_sources)
        
        # Quanto mais próximo de 0, melhor (transformando em uma escala 0-1)
        if min_distance > 3.0:  # mais de 3km é considerado distante
            return 0.2
        return 1.0 - (min_distance / 3.0) * 0.8
    
    def _calculate_climate_suitability(self, climate: ClimateData) -> float:
        """Calcula adequação do clima para apicultura"""
        # Faixa ideal de temperatura para abelhas (aproximado)
        temp_score = 1.0
        if climate.average_temperature < 12 or climate.average_temperature > 25:
            temp_score = 0.7
            
        # Velocidade do vento (idealmente baixa)
        wind_score = 1.0 - min(1.0, climate.wind_speed_avg / 30.0)
        
        # Pluviosidade (média é melhor)
        rain_score = 1.0
        if climate.rainfall_mm_year < 500 or climate.rainfall_mm_year > 1500:
            rain_score = 0.8
            
        # Média ponderada
        return 0.5 * temp_score + 0.3 * rain_score + 0.2 * wind_score
    
    def _calculate_overall_suitability(
        self, 
        vegetation_indices: Dict[str, float],
        water_proximity: float,
        climate_suitability: float,
        land_cover: Dict[LandCoverClass, float],
        slope_avg: float
    ) -> float:
        """Calcula pontuação geral de adequação para apicultura (0-100)"""
        # NDVI é um bom indicador de potencial de pólen/néctar
        veg_score = min(1.0, vegetation_indices.get("ndvi", 0) / 0.7) * 100
        
        # A cobertura ideal do solo incluiria combinação de floresta, áreas arbustivas e campos
        land_score = (
            land_cover.get(LandCoverClass.FOREST, 0) * 0.7 + 
            land_cover.get(LandCoverClass.SHRUBLAND, 0) * 1.0 +
            land_cover.get(LandCoverClass.GRASSLAND, 0) * 0.8 +
            land_cover.get(LandCoverClass.CROPLAND, 0) * 0.5 - 
            land_cover.get(LandCoverClass.URBAN, 0) * 0.8
        ) * 100
        
        # Inclinação (terreno inclinado demais pode ser negativo)
        slope_score = max(0, 100 - (slope_avg - 5) * 3) if slope_avg > 5 else 100
        
        # Média ponderada para o score final
        final_score = (
            0.35 * veg_score + 
            0.15 * land_score +
            0.20 * (water_proximity * 100) +
            0.20 * (climate_suitability * 100) +
            0.10 * slope_score
        )
        
        return min(100, max(0, final_score)) 