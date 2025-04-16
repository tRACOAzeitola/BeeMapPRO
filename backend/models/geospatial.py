from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from enum import Enum

class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class Area(BaseModel):
    """Representa uma área geográfica definida por um polígono de coordenadas"""
    points: List[Coordinates]
    center: Optional[Coordinates] = None
    area_km2: Optional[float] = None
    
    class Config:
        schema_extra = {
            "example": {
                "points": [
                    {"latitude": 39.5, "longitude": -8.2},
                    {"latitude": 39.52, "longitude": -8.2},
                    {"latitude": 39.52, "longitude": -8.18},
                    {"latitude": 39.5, "longitude": -8.18}
                ]
            }
        }

class VegetationIndex(str, Enum):
    NDVI = "ndvi"  # Índice de Vegetação por Diferença Normalizada
    EVI = "evi"   # Índice de Vegetação Melhorado
    LAI = "lai"   # Índice de Área Foliar

class LandCoverClass(str, Enum):
    FOREST = "forest"
    SHRUBLAND = "shrubland"
    GRASSLAND = "grassland"
    CROPLAND = "cropland"
    URBAN = "urban"
    WATER = "water"
    BARREN = "barren"

class WaterSource(BaseModel):
    coordinates: Coordinates
    type: str  # river, lake, pond, etc.
    seasonal: bool = False
    distance_from_center_km: Optional[float] = None

class VegetationData(BaseModel):
    index_type: VegetationIndex
    value: float
    timestamp: datetime
    source: str = "sentinel-2"

class ClimateData(BaseModel):
    average_temperature: float  # °C
    min_temperature: float
    max_temperature: float
    rainfall_mm_year: float
    wind_speed_avg: float  # km/h
    humidity_avg: float  # percentage
    timestamp: datetime
    source: str = "worldclim"

class GeospatialAnalysis(BaseModel):
    """Resultado completo de análise geoespacial de uma área"""
    area: Area
    vegetation_indices: Dict[str, float]
    land_cover: Dict[LandCoverClass, float]  # percentages
    water_sources: List[WaterSource]
    climate: ClimateData
    elevation_range: Tuple[float, float]  # min, max in meters
    slope_avg: float  # degrees
    aspect: str  # predominant direction
    timestamp: datetime
    
    # Métricas específicas para apicultura
    flowering_plants_percentage: float
    water_proximity_score: float  # 0-1
    climate_suitability_score: float  # 0-1
    overall_bee_suitability: float  # 0-100 