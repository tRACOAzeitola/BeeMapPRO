"""
API para o módulo de detecção de flora
"""

import os
import json
import tempfile
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
from .utils import extract_sentinel2_bands, create_spectral_indices, create_feature_stack, detect_rosemary, plot_detection_results
from .models import load_model
from .geo_cnn import GeoCNN, calculate_vegetation_health, estimate_flowering_stage
import requests
import datetime
import shapely.geometry
import rasterio
from rasterio.mask import mask

app = Flask(__name__)

# Variáveis globais para modelos e configuração
MODEL_PATH = os.getenv('MODEL_PATH', './models/rosemary_detector.pkl')
MODEL_TYPE = os.getenv('MODEL_TYPE', 'sklearn')  # 'sklearn' ou 'tensorflow'
THRESHOLD = float(os.getenv('THRESHOLD', '0.5'))  # Threshold para detecção
SENTINEL_HUB_API_KEY = os.getenv('SENTINEL_HUB_API_KEY', '')  # Chave API para Sentinel Hub

@app.route('/api/flora/detect', methods=['POST'])
def detect_flora():
    """
    Endpoint da API para detecção de flora
    
    Parâmetros POST:
    ----------------
    image_data : str (imagem codificada em base64) ou arquivo
        Dados da imagem para análise
    
    Retorna:
    --------
    JSON com resultados da detecção
    """
    try:
        # Verificar se a solicitação contém um arquivo ou imagem codificada em base64
        if 'image' in request.files:
            # Salvar o arquivo carregado em um local temporário
            file = request.files['image']
            temp_dir = tempfile.mkdtemp()
            image_path = os.path.join(temp_dir, file.filename)
            file.save(image_path)
        elif 'image_data' in request.json:
            # Decodificar imagem base64 e salvar em arquivo temporário
            base64_data = request.json['image_data']
            image_data = base64.b64decode(base64_data)
            temp_dir = tempfile.mkdtemp()
            image_path = os.path.join(temp_dir, 'image.tif')
            with open(image_path, 'wb') as f:
                f.write(image_data)
        else:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado de imagem fornecido'
            }), 400
        
        # Extrair parâmetros
        model_path = request.json.get('model_path', MODEL_PATH)
        model_type = request.json.get('model_type', MODEL_TYPE)
        threshold = float(request.json.get('threshold', THRESHOLD))
        
        # Carregar modelo
        try:
            model = load_model(model_path, model_type)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Falha ao carregar modelo: {str(e)}'
            }), 500
        
        # Processar a imagem
        try:
            # Extrair bandas
            bands = extract_sentinel2_bands(image_path)
            
            # Criar composto RGB para visualização
            rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=0)
            rgb = np.transpose(rgb, (1, 2, 0))
            
            # Normalizar para visualização
            rgb_norm = (rgb - rgb.min()) / (rgb.max() - rgb.min())
            
            # Calcular índices
            indices = create_spectral_indices(bands)
            
            # Criar feature stack
            feature_stack = create_feature_stack(bands, indices)
            
            # Fazer predição
            detection_result = detect_rosemary(image_path, model_path)
            
            # Gerar visualização
            fig, ax = plt.subplots(1, 2, figsize=(12, 6))
            ax[0].imshow(rgb_norm)
            ax[0].set_title('Imagem Original')
            ax[0].axis('off')
            
            # Plotar NDVI para demonstração
            ndvi_viz = indices['ndvi']
            ndvi_viz = np.clip(ndvi_viz, -1, 1)  # Limitar para faixa padrão de NDVI
            ax[1].imshow(ndvi_viz, cmap='RdYlGn', vmin=-1, vmax=1)
            ax[1].set_title('NDVI (Índice de Vegetação)')
            ax[1].axis('off')
            
            # Salvar gráfico em objeto BytesIO
            buf = BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            plt.close(fig)
            
            # Codificar a imagem em base64
            image_base64 = base64.b64encode(buf.read()).decode('utf-8')
            
            # Calcular estatísticas
            if detection_result is not None:
                # Contar pixels por classe
                unique, counts = np.unique(detection_result, return_counts=True)
                stats = dict(zip(unique.tolist(), counts.tolist()))
                
                # Calcular percentagem de cobertura de rosmaninho
                total_pixels = detection_result.size
                rosemary_pixels = stats.get(1, 0)  # Classe 1 é rosmaninho
                coverage_percent = (rosemary_pixels / total_pixels) * 100 if total_pixels > 0 else 0
            else:
                stats = {}
                coverage_percent = 0
            
            return jsonify({
                'success': True,
                'image_preview': image_base64,
                'stats': {
                    'rosemary_coverage_percent': coverage_percent,
                    'class_distribution': stats
                },
                'metadata': {
                    'image_size': rgb.shape,
                    'ndvi_range': [float(indices['ndvi'].min()), float(indices['ndvi'].max())]
                }
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Erro de processamento de imagem: {str(e)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro inesperado: {str(e)}'
        }), 500
    finally:
        # Limpar arquivos temporários
        if 'temp_dir' in locals() and os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)

@app.route('/api/flora/analyze-area', methods=['POST'])
def analyze_area():
    """
    Endpoint da API para analisar uma área geográfica desenhada no mapa
    
    Parâmetros POST:
    ----------------
    type : str
        Tipo de área ('polygon' ou 'rectangle')
    coordinates : list
        Lista de coordenadas [lat, lng] definindo a área
    date : str, opcional
        Data no formato AAAA-MM-DD para análise temporal
    
    Retorna:
    --------
    JSON com resultados da análise
    """
    try:
        # Extrair parâmetros da solicitação
        data = request.json
        area_type = data.get('type')
        coordinates = data.get('coordinates')
        date_str = data.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
        
        if not area_type or not coordinates:
            return jsonify({
                'success': False,
                'error': 'Tipo de área ou coordenadas ausentes'
            }), 400
        
        # Converter coordenadas para um polígono GeoJSON
        if area_type == 'polygon':
            # Para polígono, as coordenadas já estão no formato certo
            polygon = shapely.geometry.Polygon(coordinates)
        elif area_type == 'rectangle':
            # Para retângulo, as coordenadas são os quatro cantos
            polygon = shapely.geometry.Polygon(coordinates)
        else:
            return jsonify({
                'success': False,
                'error': f'Tipo de área não suportado: {area_type}'
            }), 400
        
        # Calcular área em hectares (aproximado)
        # Observação: Esta é uma calculação simplificada e não leva em conta a curvatura da Terra
        area_m2 = calculate_area_in_m2(polygon)
        area_hectares = area_m2 / 10000  # Converter m² para hectares
        
        # Verificar se a área é grande demais
        if area_hectares > 1000:  # 1000 hectares = 10 km²
            return jsonify({
                'success': False,
                'error': f'Área muito grande: {area_hectares:.2f} hectares. Máximo permitido é 1000 hectares.'
            }), 400
        
        # Buscar imagem Sentinel-2 para a área
        # Em uma implementação real, você usaria Sentinel Hub ou serviço similar para obter a imagem
        # Para este exemplo, vamos criar um placeholder para demonstração
        try:
            sentinel_image_path = fetch_sentinel_image(polygon, date_str)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Falha ao buscar imagem de satélite: {str(e)}'
            }), 500
        
        # Carregar o modelo GeoCNN para análise
        try:
            geo_cnn = GeoCNN.load(MODEL_PATH)
        except:
            # Se o modelo não existir, criar um novo
            geo_cnn = GeoCNN(input_shape=(10, 64, 64), num_classes=4)
        
        # Criar diretório temporário para saídas
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, 'analysis_result.png')
        
        # Analisar a área com o modelo GeoCNN
        try:
            # Extrair bandas da imagem Sentinel
            bands = extract_sentinel2_bands(sentinel_image_path)
            
            # Calcular índices
            indices = create_spectral_indices(bands)
            
            # Executar a predição
            prediction = geo_cnn.predict_image(
                sentinel_image_path,
                output_path=output_path,
                visualize=True
            )
            
            # Calcular saúde da vegetação
            health_metrics = calculate_vegetation_health(indices['ndvi'])
            
            # Estimar estágio de floração se a data for fornecida
            flowering_info = estimate_flowering_stage(
                indices['ndvi'],
                indices['evi'],
                date_str
            )
            
            # Criar um relatório de análise detalhado
            report_path = os.path.join(temp_dir, 'detailed_report.png')
            create_detailed_report(
                bands, indices, health_metrics, flowering_info, report_path
            )
            
            # Codificar imagens em base64 para resposta
            with open(output_path, 'rb') as f:
                prediction_image = base64.b64encode(f.read()).decode('utf-8')
            
            with open(report_path, 'rb') as f:
                report_image = base64.b64encode(f.read()).decode('utf-8')
            
            # Calcular distribuição aproximada de flora
            # Em uma implementação real, isso viria da predição do modelo
            flora_distribution = {
                'rosemary': health_metrics['healthy'] * 0.8,  # Percentagem de rosmaninho (exemplo)
                'heather': health_metrics['very_healthy'] * 0.6,  # Percentagem de urze (exemplo)
                'eucalyptus': health_metrics['moderate'] * 0.3,  # Percentagem de eucalipto (exemplo)
                'other': 100 - (health_metrics['healthy'] * 0.8 + health_metrics['very_healthy'] * 0.6 + health_metrics['moderate'] * 0.3)
            }
            
            # Criar um resumo da análise
            # Estes valores seriam calculados com base na análise real
            beekeeping_suitability = min(95, max(30, health_metrics['average_ndvi'] * 100))
            water_availability = 65  # Valor exemplo (0-100)
            climate_suitability = 80  # Valor exemplo (0-100)
            
            # Calcular potencial de néctar sazonal com base nas informações de floração
            if flowering_info:
                nectar_potential = 0
                for species, info in flowering_info['species_stage'].items():
                    nectar_potential += info['flowering_percent'] * flora_distribution.get(species, 0) / 100
                nectar_potential = min(100, max(0, nectar_potential))
            else:
                nectar_potential = 50  # Valor padrão
            
            # Calcular pontuação geral
            overall_score = int(0.4 * beekeeping_suitability + 
                              0.2 * water_availability + 
                              0.2 * climate_suitability + 
                              0.2 * nectar_potential)
            
            # Preparar resposta
            response = {
                'success': True,
                'area_hectares': area_hectares,
                'prediction_image': prediction_image,
                'report_image': report_image,
                'analysis': {
                    'overall_score': overall_score,
                    'beekeeping_suitability': int(beekeeping_suitability),
                    'water_availability': int(water_availability),
                    'climate_suitability': int(climate_suitability),
                    'nectar_potential': int(nectar_potential),
                    'health_metrics': health_metrics,
                    'flora_distribution': flora_distribution,
                    'flowering_info': flowering_info
                },
                'metadata': {
                    'date_analyzed': datetime.datetime.now().isoformat(),
                    'coordinates': coordinates,
                    'type': area_type
                }
            }
            
            return jsonify(response)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Erro de análise: {str(e)}'
            }), 500
        finally:
            # Limpar arquivos temporários
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro inesperado: {str(e)}'
        }), 500

def calculate_area_in_m2(polygon):
    """
    Calcular área aproximada em metros quadrados
    
    Parâmetros:
    -----------
    polygon : shapely.geometry.Polygon
        Polígono definindo a área
    
    Retorna:
    --------
    area : float
        Área aproximada em metros quadrados
    """
    # Esta é uma calculação simplificada
    # Para cálculos mais precisos, use GeoPandas com projeções adequadas
    # ou converta para uma projeção UTM local para a área
    
    # Para áreas pequenas, esta aproximação é razoável
    # 1 grau de latitude ≈ 111 km
    # 1 grau de longitude ≈ 111 km * cos(latitude)
    
    # Calcular latitude do centróide para escala de longitude
    centroid = polygon.centroid
    lat_scale = 111000  # metros por grau de latitude
    lng_scale = 111000 * np.cos(np.radians(centroid.y))  # metros por grau de longitude
    
    # Criar um polígono escalado
    scaled_coords = []
    for x, y in polygon.exterior.coords:
        scaled_coords.append((x * lng_scale, y * lat_scale))
    
    scaled_polygon = shapely.geometry.Polygon(scaled_coords)
    
    return scaled_polygon.area

def fetch_sentinel_image(polygon, date_str):
    """
    Buscar imagem Sentinel-2 para a área e data especificadas
    
    Parâmetros:
    -----------
    polygon : shapely.geometry.Polygon
        Polígono definindo a área
    date_str : str
        Data no formato AAAA-MM-DD
    
    Retorna:
    --------
    image_path : str
        Caminho para a imagem Sentinel-2 baixada
    """
    # Esta é uma função placeholder
    # Em uma implementação real, você usaria a API Sentinel Hub ou serviço similar
    
    # Para fins de demonstração, vamos criar uma imagem falsa
    # Em uma aplicação real, use a API Sentinel Hub ou similar para baixar imagens reais
    
    # Criar um diretório temporário para a imagem
    temp_dir = tempfile.mkdtemp()
    image_path = os.path.join(temp_dir, 'sentinel_image.tif')
    
    # Criar uma imagem falsa com estrutura adequada
    # Isto deve ser substituído por imagens reais do Sentinel-2 em produção
    
    # Apenas para fins de demonstração - criar um raster simples
    height, width = 500, 500
    num_bands = 12  # Sentinel-2 tem múltiplas bandas
    
    # Criar dados aleatórios para cada banda
    data = np.random.rand(num_bands, height, width).astype(np.float32)
    
    # Definir transformação e CRS
    # Esta é uma transformação placeholder - na prática, use georreferenciamento adequado
    transform = rasterio.transform.from_bounds(
        polygon.bounds[0], polygon.bounds[1], 
        polygon.bounds[2], polygon.bounds[3],
        width, height
    )
    
    # Criar um GeoTIFF com os dados sintéticos
    with rasterio.open(
        image_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=num_bands,
        dtype=data.dtype,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        for i in range(num_bands):
            dst.write(data[i], i + 1)
    
    return image_path

def create_detailed_report(bands, indices, health_metrics, flowering_info, output_path):
    """
    Criar um relatório detalhado com múltiplas visualizações
    
    Parâmetros:
    -----------
    bands : dict
        Dicionário com bandas extraídas
    indices : dict
        Dicionário com índices espectrais calculados
    health_metrics : dict
        Dicionário com métricas de saúde da vegetação
    flowering_info : dict
        Dicionário com informações do estágio de floração
    output_path : str
        Caminho para salvar o relatório
    """
    # Criar uma figura com múltiplos subplots
    fig = plt.figure(figsize=(15, 10))
    
    # 1. Composto RGB
    ax1 = fig.add_subplot(2, 3, 1)
    rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=2)
    rgb = (rgb - rgb.min()) / (rgb.max() - rgb.min())
    ax1.imshow(rgb)
    ax1.set_title('Composto RGB')
    ax1.axis('off')
    
    # 2. Visualização NDVI
    ax2 = fig.add_subplot(2, 3, 2)
    ndvi_display = indices['ndvi']
    ndvi_display = np.clip(ndvi_display, -1, 1)
    im = ax2.imshow(ndvi_display, cmap='RdYlGn', vmin=-1, vmax=1)
    plt.colorbar(im, ax=ax2, label='NDVI')
    ax2.set_title('NDVI (Índice de Vegetação)')
    ax2.axis('off')
    
    # 3. Visualização EVI
    ax3 = fig.add_subplot(2, 3, 3)
    evi_display = indices['evi']
    evi_display = np.clip(evi_display, -1, 1)
    im = ax3.imshow(evi_display, cmap='RdYlGn', vmin=-1, vmax=1)
    plt.colorbar(im, ax=ax3, label='EVI')
    ax3.set_title('EVI (Índice de Vegetação Melhorado)')
    ax3.axis('off')
    
    # 4. Gráfico de pizza de saúde da vegetação
    ax4 = fig.add_subplot(2, 3, 4)
    health_labels = ['Não saudável', 'Moderada', 'Saudável', 'Muito Saudável', 'Excepcional']
    health_values = [
        health_metrics['unhealthy'],
        health_metrics['moderate'],
        health_metrics['healthy'],
        health_metrics['very_healthy'],
        health_metrics['exceptional']
    ]
    ax4.pie(health_values, labels=health_labels, autopct='%1.1f%%')
    ax4.set_title('Distribuição de Saúde da Vegetação')
    
    # 5. Informações do estágio de floração (se disponível)
    ax5 = fig.add_subplot(2, 3, 5)
    if flowering_info:
        species = list(flowering_info['species_stage'].keys())
        flowering_percentages = [info['flowering_percent'] 
                                for info in flowering_info['species_stage'].values()]
        
        ax5.bar(species, flowering_percentages)
        ax5.set_title(f'Estágio de Floração ({flowering_info["season"].capitalize()})')
        ax5.set_ylabel('Percentagem de Floração')
        ax5.set_ylim(0, 110)
    else:
        ax5.text(0.5, 0.5, 'Nenhuma informação de floração disponível', 
               ha='center', va='center', fontsize=12)
        ax5.set_title('Estágio de Floração')
        ax5.axis('off')
    
    # 6. Caixa de texto com informações adicionais
    ax6 = fig.add_subplot(2, 3, 6)
    ax6.axis('off')
    ax6.text(0.05, 0.95, 'Resumo da Análise', fontsize=14, fontweight='bold', 
             va='top')
    
    summary_text = [
        f'NDVI Médio: {health_metrics["average_ndvi"]:.3f}',
        f'Estação: {flowering_info["season"].capitalize() if flowering_info else "Desconhecida"}',
        '\nFlora Potencial:',
    ]
    
    if flowering_info:
        for species, info in flowering_info['species_stage'].items():
            summary_text.append(f'  • {species.capitalize()}: Estágio {info["stage"].capitalize()}')
    
    ax6.text(0.05, 0.85, '\n'.join(summary_text), va='top', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close(fig)

def start_server(host='127.0.0.1', port=5001):
    """
    Iniciar o servidor Flask
    
    Parâmetros:
    -----------
    host : str, default='127.0.0.1'
        Host para vincular o servidor
    port : int, default=5001
        Porta para vincular o servidor
    """
    app.run(host=host, port=port)

if __name__ == '__main__':
    start_server(host='0.0.0.0') 