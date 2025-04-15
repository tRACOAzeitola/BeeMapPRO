# BeeMap Pro - Python Backend

This Python backend provides advanced geospatial analysis and machine learning capabilities for the BeeMap Pro platform, specifically focusing on the detection and analysis of melliferous flora (bee-friendly plants) using satellite imagery.

## Features

### Deep Learning for Flora Detection
- **Convolutional Neural Networks** for analyzing Sentinel-2 satellite imagery
- **Pixel-wise segmentation** of different flora species (rosemary, heather, eucalyptus, etc.)
- **Transfer learning** capabilities using pre-trained models

### Vegetation Health Analysis
- **NDVI** (Normalized Difference Vegetation Index) calculation and visualization
- **EVI** (Enhanced Vegetation Index) for improved vegetation sensitivity
- **MSAVI** (Modified Soil Adjusted Vegetation Index) for areas with sparse vegetation

### Flowering Stage Estimation
- **Temporal analysis** to determine flowering phases
- **Seasonal modeling** for different plant species
- **Nectar potential** estimation based on flowering stage and vegetation health

### API Integration
- **RESTful API** for seamless communication with the main application
- **Real-time processing** of uploaded imagery
- **JSON response** with detailed analysis results

## Installation

### Prerequisites
- Python 3.8+
- GDAL (for geospatial data processing)
- TensorFlow 2.x (for deep learning)

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/your-repo/beekeeping-intelligence.git
cd beekeeping-intelligence/python
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Install optional dependencies for local development
```bash
pip install -r requirements-dev.txt
```

## Usage

### Running the API Server

```bash
python main.py --host 0.0.0.0 --port 5001
```

### Using the GeoCNN Module

The GeoCNN module provides deep learning capabilities for flora detection:

```python
from flora_detection.geo_cnn import GeoCNN

# Create a new GeoCNN model
geo_cnn = GeoCNN(input_shape=(10, 64, 64), num_classes=4)

# Train the model (with your labeled data)
geo_cnn.train(X_train, y_train, epochs=50)

# Save the model
geo_cnn.save('./models/my_geo_cnn_model.h5')

# Load a pre-trained model
loaded_model = GeoCNN.load('./models/my_geo_cnn_model.h5')

# Analyze a Sentinel-2 image
prediction = loaded_model.predict_image(
    'path/to/sentinel2_image.tif',
    output_path='./output/prediction.png'
)
```

### Example Scripts

Check the `examples` directory for sample scripts demonstrating different functionalities:

- `geo_cnn_demo.py`: Demonstrates flora detection using GeoCNN
- `vegetation_health.py`: Shows how to analyze vegetation health indices
- `flowering_estimation.py`: Example of estimating flowering stages

Run an example:
```bash
python examples/geo_cnn_demo.py --input ./data/sentinel2_sample.tif --output-dir ./output
```

## API Endpoints

### Flora Detection

**Endpoint**: `/api/flora/detect`  
**Method**: POST  
**Description**: Detects melliferous flora in satellite imagery

**Request Body**:
```json
{
  "image_data": "base64_encoded_image_data",
  "model_type": "tensorflow",
  "threshold": 0.5
}
```

**Response**:
```json
{
  "success": true,
  "image_preview": "base64_encoded_preview_image",
  "stats": {
    "rosemary_coverage_percent": 18.5,
    "class_distribution": {
      "0": 325000,
      "1": 75000,
      "2": 25000,
      "3": 5000
    }
  },
  "metadata": {
    "image_size": [500, 500, 3],
    "ndvi_range": [-0.5, 0.9]
  }
}
```

## Development

### Code Structure

- `main.py`: Main entry point for the API server
- `flora_detection/`: Package containing flora detection modules
  - `api.py`: API server implementation
  - `utils.py`: Utility functions for processing satellite imagery
  - `models.py`: Machine learning model definitions
  - `geo_cnn.py`: Geographic CNN implementation
- `examples/`: Example scripts demonstrating functionalities
- `models/`: Pre-trained models
- `output/`: Default directory for saving outputs
- `data/`: Sample data for testing (not included in repository)

### Contributing

1. Create a feature branch
2. Implement your changes
3. Write or update tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 