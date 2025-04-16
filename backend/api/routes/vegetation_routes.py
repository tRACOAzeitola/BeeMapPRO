from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from models.geospatial import Area, Coordinates
from services.ml_service import MLService
import json
import logging

# Configurar logging
logger = logging.getLogger(__name__)

# Criar router
router = APIRouter(
    prefix="/api/vegetation",
    tags=["vegetation"],
    responses={404: {"description": "Não encontrado"}},
)

# Inicializar serviço ML
ml_service = MLService()

@router.post("/analyze-area")
async def analyze_area(area_data: dict = Body(...)):
    """
    Analisa uma área para determinar potencial de flora melífera
    
    Parâmetros:
    - **area_data**: Dados da área incluindo tipo (polígono ou retângulo) e coordenadas
    """
    try:
        # Extrair dados
        area_type = area_data.get("type")
        coordinates_raw = area_data.get("coordinates", [])
        
        if not area_type or not coordinates_raw:
            raise HTTPException(status_code=400, detail="Tipo de área ou coordenadas ausentes")
        
        # Converter coordenadas para objetos Coordinates
        coordinates = [
            Coordinates(latitude=point[0], longitude=point[1]) 
            for point in coordinates_raw
        ]
        
        # Criar objeto Area
        area = Area(
            points=coordinates,
            center=None,  # Será calculado pelo serviço
            area_km2=None  # Será calculado pelo serviço
        )
        
        # Analisar área
        logger.info(f"Analisando área do tipo {area_type} com {len(coordinates)} pontos")
        analysis_results = ml_service.analyze_area_potential(area)
        
        return JSONResponse(content=analysis_results)
        
    except Exception as e:
        logger.error(f"Erro ao analisar área: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao analisar área: {str(e)}")

@router.get("/flora-types")
async def get_flora_types():
    """
    Retorna tipos de flora melífera importantes para apicultura
    """
    flora_types = [
        {
            "id": "rosemary",
            "name": "Rosmaninho",
            "scientific_name": "Lavandula stoechas",
            "description": "Planta aromática com flores roxas, muito valorizada para mel de alta qualidade",
            "flowering_months": [3, 4, 5, 6],  # Março a Junho
            "nectar_value": 9,  # 0-10
            "pollen_value": 7,  # 0-10
            "honey_attributes": ["aromático", "claro", "propriedades medicinais"],
            "regions": ["Alentejo", "Trás-os-Montes", "Beira Interior"]
        },
        {
            "id": "heather",
            "name": "Urze",
            "scientific_name": "Erica spp.",
            "description": "Arbusto de pequeno porte com flores tubulares, produz mel escuro e rico",
            "flowering_months": [8, 9, 10, 11],  # Agosto a Novembro
            "nectar_value": 8,
            "pollen_value": 6,
            "honey_attributes": ["escuro", "forte", "aromático"],
            "regions": ["Serra da Estrela", "Gerês", "Montanhas do Norte"]
        },
        {
            "id": "eucalyptus",
            "name": "Eucalipto",
            "scientific_name": "Eucalyptus globulus",
            "description": "Árvore de grande porte, muito comum em Portugal, produz mel claro",
            "flowering_months": [11, 12, 1, 2],  # Novembro a Fevereiro
            "nectar_value": 7,
            "pollen_value": 8,
            "honey_attributes": ["suave", "claro", "balsâmico"],
            "regions": ["Centro", "Litoral Norte", "Litoral Centro"]
        },
        {
            "id": "orange",
            "name": "Laranjeira",
            "scientific_name": "Citrus sinensis",
            "description": "Árvore frutífera que produz um dos méis mais valorizados pelo aroma delicado",
            "flowering_months": [4, 5],  # Abril e Maio
            "nectar_value": 9,
            "pollen_value": 5,
            "honey_attributes": ["claro", "floral", "cítrico", "delicado"],
            "regions": ["Algarve", "Ribatejo"]
        }
    ]
    
    return flora_types

@router.get("/suitable-regions")
async def get_suitable_regions():
    """
    Retorna regiões de Portugal adequadas para diferentes tipos de flora melífera
    """
    regions = [
        {
            "name": "Alentejo Interior",
            "center": [38.5, -7.8],
            "flora_types": ["rosemary", "thyme", "heather"],
            "suitability_score": 85,
            "environmental_conditions": {
                "avg_temperature": 17.2,
                "rainfall_mm_year": 650,
                "elevation": "200-400m"
            }
        },
        {
            "name": "Serra da Estrela",
            "center": [40.3, -7.6],
            "flora_types": ["heather", "chestnut", "wildflowers"],
            "suitability_score": 78,
            "environmental_conditions": {
                "avg_temperature": 13.5,
                "rainfall_mm_year": 1200,
                "elevation": "700-1200m"
            }
        },
        {
            "name": "Trás-os-Montes",
            "center": [41.5, -7.0],
            "flora_types": ["rosemary", "heather", "chestnut", "almond"],
            "suitability_score": 82,
            "environmental_conditions": {
                "avg_temperature": 14.3,
                "rainfall_mm_year": 800,
                "elevation": "400-800m"
            }
        },
        {
            "name": "Algarve",
            "center": [37.2, -8.0],
            "flora_types": ["orange", "carob", "rosemary"],
            "suitability_score": 79,
            "environmental_conditions": {
                "avg_temperature": 18.9,
                "rainfall_mm_year": 500,
                "elevation": "0-200m"
            }
        }
    ]
    
    return regions 