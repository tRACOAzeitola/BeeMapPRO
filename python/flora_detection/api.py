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

app = Flask(__name__)

# Global variables for models and configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/rosemary_detector.pkl')
MODEL_TYPE = os.getenv('MODEL_TYPE', 'sklearn')  # 'sklearn' or 'tensorflow'
THRESHOLD = float(os.getenv('THRESHOLD', '0.5'))  # Threshold for detection

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