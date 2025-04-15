"""
API for flora detection module
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

# Global variables for models and configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/rosemary_detector.pkl')
MODEL_TYPE = os.getenv('MODEL_TYPE', 'sklearn')  # 'sklearn' or 'tensorflow'
THRESHOLD = float(os.getenv('THRESHOLD', '0.5'))  # Threshold for detection
SENTINEL_HUB_API_KEY = os.getenv('SENTINEL_HUB_API_KEY', '')  # API key for Sentinel Hub

@app.route('/api/flora/detect', methods=['POST'])
def detect_flora():
    """
    API endpoint for flora detection
    
    POST parameters:
    ----------------
    image_data : str (base64 encoded image) or file
        Image data for analysis
    
    Returns:
    --------
    JSON with detection results
    """
    try:
        # Check if the request contains a file or base64 encoded image
        if 'image' in request.files:
            # Save the uploaded file to a temporary location
            file = request.files['image']
            temp_dir = tempfile.mkdtemp()
            image_path = os.path.join(temp_dir, file.filename)
            file.save(image_path)
        elif 'image_data' in request.json:
            # Decode base64 image and save to a temporary file
            base64_data = request.json['image_data']
            image_data = base64.b64decode(base64_data)
            temp_dir = tempfile.mkdtemp()
            image_path = os.path.join(temp_dir, 'image.tif')
            with open(image_path, 'wb') as f:
                f.write(image_data)
        else:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        # Extract parameters
        model_path = request.json.get('model_path', MODEL_PATH)
        model_type = request.json.get('model_type', MODEL_TYPE)
        threshold = float(request.json.get('threshold', THRESHOLD))
        
        # Load model
        try:
            model = load_model(model_path, model_type)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to load model: {str(e)}'
            }), 500
        
        # Process the image
        try:
            # Extract bands
            bands = extract_sentinel2_bands(image_path)
            
            # Create RGB composite for visualization
            rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=0)
            rgb = np.transpose(rgb, (1, 2, 0))
            
            # Normalize for visualization
            rgb_norm = (rgb - rgb.min()) / (rgb.max() - rgb.min())
            
            # Calculate indices
            indices = create_spectral_indices(bands)
            
            # Create feature stack
            feature_stack = create_feature_stack(bands, indices)
            
            # Make prediction
            detection_result = detect_rosemary(image_path, model_path)
            
            # Generate visualization
            fig, ax = plt.subplots(1, 2, figsize=(12, 6))
            ax[0].imshow(rgb_norm)
            ax[0].set_title('Original Image')
            ax[0].axis('off')
            
            # Plot NDVI for demonstration
            ndvi_viz = indices['ndvi']
            ndvi_viz = np.clip(ndvi_viz, -1, 1)  # Clip to standard NDVI range
            ax[1].imshow(ndvi_viz, cmap='RdYlGn', vmin=-1, vmax=1)
            ax[1].set_title('NDVI (Vegetation Index)')
            ax[1].axis('off')
            
            # Save plot to a BytesIO object
            buf = BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            plt.close(fig)
            
            # Encode the image to base64
            image_base64 = base64.b64encode(buf.read()).decode('utf-8')
            
            # Calculate statistics
            if detection_result is not None:
                # Count pixels by class
                unique, counts = np.unique(detection_result, return_counts=True)
                stats = dict(zip(unique.tolist(), counts.tolist()))
                
                # Calculate percentage of rosemary coverage
                total_pixels = detection_result.size
                rosemary_pixels = stats.get(1, 0)  # Class 1 is rosemary
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
                'error': f'Image processing error: {str(e)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500
    finally:
        # Clean up temporary files
        if 'temp_dir' in locals() and os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)

@app.route('/api/flora/analyze-area', methods=['POST'])
def analyze_area():
    """
    API endpoint for analyzing a geographic area drawn on the map
    
    POST parameters:
    ----------------
    type : str
        Type of area ('polygon' or 'rectangle')
    coordinates : list
        List of [lat, lng] coordinates defining the area
    date : str, optional
        Date in format YYYY-MM-DD for temporal analysis
    
    Returns:
    --------
    JSON with analysis results
    """
    try:
        # Extract parameters from request
        data = request.json
        area_type = data.get('type')
        coordinates = data.get('coordinates')
        date_str = data.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
        
        if not area_type or not coordinates:
            return jsonify({
                'success': False,
                'error': 'Missing area type or coordinates'
            }), 400
        
        # Convert coordinates to a GeoJSON polygon
        if area_type == 'polygon':
            # For polygon, the coordinates are already in the right format
            polygon = shapely.geometry.Polygon(coordinates)
        elif area_type == 'rectangle':
            # For rectangle, the coordinates are the four corners
            polygon = shapely.geometry.Polygon(coordinates)
        else:
            return jsonify({
                'success': False,
                'error': f'Unsupported area type: {area_type}'
            }), 400
        
        # Calculate area in hectares (approximate)
        # Note: This is a simplified calculation and doesn't account for Earth's curvature
        area_m2 = calculate_area_in_m2(polygon)
        area_hectares = area_m2 / 10000  # Convert m² to hectares
        
        # Check if the area is too large
        if area_hectares > 1000:  # 1000 hectares = 10 km²
            return jsonify({
                'success': False,
                'error': f'Area too large: {area_hectares:.2f} hectares. Maximum allowed is 1000 hectares.'
            }), 400
        
        # Fetch Sentinel-2 imagery for the area
        # In a real implementation, you would use Sentinel Hub or similar service to get the image
        # For this example, we'll create a placeholder for demonstration
        try:
            sentinel_image_path = fetch_sentinel_image(polygon, date_str)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch satellite imagery: {str(e)}'
            }), 500
        
        # Load the GeoCNN model for analysis
        try:
            geo_cnn = GeoCNN.load(MODEL_PATH)
        except:
            # If model doesn't exist, create a new one
            geo_cnn = GeoCNN(input_shape=(10, 64, 64), num_classes=4)
        
        # Create temporary directory for outputs
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, 'analysis_result.png')
        
        # Analyze the area with the GeoCNN model
        try:
            # Extract bands from the Sentinel image
            bands = extract_sentinel2_bands(sentinel_image_path)
            
            # Calculate indices
            indices = create_spectral_indices(bands)
            
            # Run the prediction
            prediction = geo_cnn.predict_image(
                sentinel_image_path,
                output_path=output_path,
                visualize=True
            )
            
            # Calculate vegetation health
            health_metrics = calculate_vegetation_health(indices['ndvi'])
            
            # Estimate flowering stage if date is provided
            flowering_info = estimate_flowering_stage(
                indices['ndvi'],
                indices['evi'],
                date_str
            )
            
            # Create a detailed analysis report
            report_path = os.path.join(temp_dir, 'detailed_report.png')
            create_detailed_report(
                bands, indices, health_metrics, flowering_info, report_path
            )
            
            # Encode images to base64 for response
            with open(output_path, 'rb') as f:
                prediction_image = base64.b64encode(f.read()).decode('utf-8')
            
            with open(report_path, 'rb') as f:
                report_image = base64.b64encode(f.read()).decode('utf-8')
            
            # Calculate approximate flora distribution
            # In a real implementation, this would come from the model prediction
            flora_distribution = {
                'rosemary': health_metrics['healthy'] * 0.8,  # Percentage of rosemary (example)
                'heather': health_metrics['very_healthy'] * 0.6,  # Percentage of heather (example)
                'eucalyptus': health_metrics['moderate'] * 0.3,  # Percentage of eucalyptus (example)
                'other': 100 - (health_metrics['healthy'] * 0.8 + health_metrics['very_healthy'] * 0.6 + health_metrics['moderate'] * 0.3)
            }
            
            # Create a summary of the analysis
            # These values would be calculated based on the actual analysis
            beekeeping_suitability = min(95, max(30, health_metrics['average_ndvi'] * 100))
            water_availability = 65  # Example value (0-100)
            climate_suitability = 80  # Example value (0-100)
            
            # Calculate seasonal nectar potential based on flowering info
            if flowering_info:
                nectar_potential = 0
                for species, info in flowering_info['species_stage'].items():
                    nectar_potential += info['flowering_percent'] * flora_distribution.get(species, 0) / 100
                nectar_potential = min(100, max(0, nectar_potential))
            else:
                nectar_potential = 50  # Default value
            
            # Calculate overall score
            overall_score = int(0.4 * beekeeping_suitability + 
                              0.2 * water_availability + 
                              0.2 * climate_suitability + 
                              0.2 * nectar_potential)
            
            # Prepare response
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
                'error': f'Analysis error: {str(e)}'
            }), 500
        finally:
            # Clean up temporary files
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500

def calculate_area_in_m2(polygon):
    """
    Calculate approximate area in square meters
    
    Parameters:
    -----------
    polygon : shapely.geometry.Polygon
        Polygon defining the area
    
    Returns:
    --------
    area : float
        Approximate area in square meters
    """
    # This is a simplified calculation
    # For more accurate calculations, use GeoPandas with proper projections
    # or convert to a local UTM projection for the area
    
    # For small areas, this approximation is reasonable
    # 1 degree of latitude ≈ 111 km
    # 1 degree of longitude ≈ 111 km * cos(latitude)
    
    # Calculate centroid latitude for longitude scaling
    centroid = polygon.centroid
    lat_scale = 111000  # meters per degree of latitude
    lng_scale = 111000 * np.cos(np.radians(centroid.y))  # meters per degree of longitude
    
    # Create a scaled polygon
    scaled_coords = []
    for x, y in polygon.exterior.coords:
        scaled_coords.append((x * lng_scale, y * lat_scale))
    
    scaled_polygon = shapely.geometry.Polygon(scaled_coords)
    
    return scaled_polygon.area

def fetch_sentinel_image(polygon, date_str):
    """
    Fetch Sentinel-2 imagery for the specified area and date
    
    Parameters:
    -----------
    polygon : shapely.geometry.Polygon
        Polygon defining the area
    date_str : str
        Date in format YYYY-MM-DD
    
    Returns:
    --------
    image_path : str
        Path to the downloaded Sentinel-2 image
    """
    # This is a placeholder function
    # In a real implementation, you would use Sentinel Hub API or similar service
    
    # For demonstration purposes, we'll create a mock image
    # In a real application, use the Sentinel Hub API or similar to download actual imagery
    
    # Create a temporary directory for the image
    temp_dir = tempfile.mkdtemp()
    image_path = os.path.join(temp_dir, 'sentinel_image.tif')
    
    # Create a mock image with proper structure
    # This should be replaced with actual Sentinel-2 imagery in production
    
    # For demonstration purposes only - create a simple raster
    height, width = 500, 500
    num_bands = 12  # Sentinel-2 has multiple bands
    
    # Create random data for each band
    data = np.random.rand(num_bands, height, width).astype(np.float32)
    
    # Set transform and CRS
    # This is a placeholder transform - in practice, use proper georeferencing
    transform = rasterio.transform.from_bounds(
        polygon.bounds[0], polygon.bounds[1], 
        polygon.bounds[2], polygon.bounds[3],
        width, height
    )
    
    # Create a GeoTIFF with the synthetic data
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
    Create a detailed report with multiple visualizations
    
    Parameters:
    -----------
    bands : dict
        Dictionary with extracted bands
    indices : dict
        Dictionary with calculated spectral indices
    health_metrics : dict
        Dictionary with vegetation health metrics
    flowering_info : dict
        Dictionary with flowering stage information
    output_path : str
        Path to save the report
    """
    # Create a figure with multiple subplots
    fig = plt.figure(figsize=(15, 10))
    
    # 1. RGB composite
    ax1 = fig.add_subplot(2, 3, 1)
    rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=2)
    rgb = (rgb - rgb.min()) / (rgb.max() - rgb.min())
    ax1.imshow(rgb)
    ax1.set_title('RGB Composite')
    ax1.axis('off')
    
    # 2. NDVI visualization
    ax2 = fig.add_subplot(2, 3, 2)
    ndvi_display = indices['ndvi']
    ndvi_display = np.clip(ndvi_display, -1, 1)
    im = ax2.imshow(ndvi_display, cmap='RdYlGn', vmin=-1, vmax=1)
    plt.colorbar(im, ax=ax2, label='NDVI')
    ax2.set_title('NDVI (Vegetation Index)')
    ax2.axis('off')
    
    # 3. EVI visualization
    ax3 = fig.add_subplot(2, 3, 3)
    evi_display = indices['evi']
    evi_display = np.clip(evi_display, -1, 1)
    im = ax3.imshow(evi_display, cmap='RdYlGn', vmin=-1, vmax=1)
    plt.colorbar(im, ax=ax3, label='EVI')
    ax3.set_title('EVI (Enhanced Vegetation Index)')
    ax3.axis('off')
    
    # 4. Vegetation health pie chart
    ax4 = fig.add_subplot(2, 3, 4)
    health_labels = ['Unhealthy', 'Moderate', 'Healthy', 'Very Healthy', 'Exceptional']
    health_values = [
        health_metrics['unhealthy'],
        health_metrics['moderate'],
        health_metrics['healthy'],
        health_metrics['very_healthy'],
        health_metrics['exceptional']
    ]
    ax4.pie(health_values, labels=health_labels, autopct='%1.1f%%')
    ax4.set_title('Vegetation Health Distribution')
    
    # 5. Flowering stage info (if available)
    ax5 = fig.add_subplot(2, 3, 5)
    if flowering_info:
        species = list(flowering_info['species_stage'].keys())
        flowering_percentages = [info['flowering_percent'] 
                                for info in flowering_info['species_stage'].values()]
        
        ax5.bar(species, flowering_percentages)
        ax5.set_title(f'Flowering Stage ({flowering_info["season"].capitalize()})')
        ax5.set_ylabel('Flowering Percentage')
        ax5.set_ylim(0, 110)
    else:
        ax5.text(0.5, 0.5, 'No flowering information available', 
               ha='center', va='center', fontsize=12)
        ax5.set_title('Flowering Stage')
        ax5.axis('off')
    
    # 6. Additional information text box
    ax6 = fig.add_subplot(2, 3, 6)
    ax6.axis('off')
    ax6.text(0.05, 0.95, 'Analysis Summary', fontsize=14, fontweight='bold', 
             va='top')
    
    summary_text = [
        f'Average NDVI: {health_metrics["average_ndvi"]:.3f}',
        f'Season: {flowering_info["season"].capitalize() if flowering_info else "Unknown"}',
        '\nPotential Flora:',
    ]
    
    if flowering_info:
        for species, info in flowering_info['species_stage'].items():
            summary_text.append(f'  • {species.capitalize()}: {info["stage"].capitalize()} stage')
    
    ax6.text(0.05, 0.85, '\n'.join(summary_text), va='top', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close(fig)

def start_server(host='127.0.0.1', port=5001):
    """
    Start the Flask server
    
    Parameters:
    -----------
    host : str, default='127.0.0.1'
        Host to bind the server to
    port : int, default=5001
        Port to bind the server to
    """
    app.run(host=host, port=port)

if __name__ == '__main__':
    start_server(host='0.0.0.0')