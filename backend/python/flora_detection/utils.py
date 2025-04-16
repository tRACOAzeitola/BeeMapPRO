"""
Utility functions for processing satellite images for flora detection
"""
import numpy as np
import rasterio
from rasterio.plot import reshape_as_image
import matplotlib.pyplot as plt
import earthpy.spatial as es
import earthpy.plot as ep
import geopandas as gpd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

def calculate_ndvi(nir_band, red_band):
    """
    Calculate the Normalized Difference Vegetation Index
    
    Parameters:
    -----------
    nir_band : numpy array
        Near-infrared band (Band 8 in Sentinel-2)
    red_band : numpy array 
        Red band (Band 4 in Sentinel-2)
        
    Returns:
    --------
    ndvi : numpy array
        NDVI values
    """
    # Avoid division by zero
    mask = (nir_band + red_band) > 0
    ndvi = np.zeros_like(nir_band, dtype=float)
    ndvi[mask] = (nir_band[mask] - red_band[mask]) / (nir_band[mask] + red_band[mask])
    return ndvi

def calculate_evi(nir_band, red_band, blue_band):
    """
    Calculate the Enhanced Vegetation Index
    
    Parameters:
    -----------
    nir_band : numpy array
        Near-infrared band (Band 8 in Sentinel-2)
    red_band : numpy array 
        Red band (Band 4 in Sentinel-2)
    blue_band : numpy array
        Blue band (Band 2 in Sentinel-2)
        
    Returns:
    --------
    evi : numpy array
        EVI values
    """
    # EVI = 2.5 * ((NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1))
    evi = 2.5 * (nir_band - red_band) / (nir_band + 6 * red_band - 7.5 * blue_band + 1)
    return evi

def calculate_msavi(nir_band, red_band):
    """
    Calculate the Modified Soil Adjusted Vegetation Index
    
    Parameters:
    -----------
    nir_band : numpy array
        Near-infrared band (Band 8 in Sentinel-2)
    red_band : numpy array 
        Red band (Band 4 in Sentinel-2)
        
    Returns:
    --------
    msavi : numpy array
        MSAVI values
    """
    # MSAVI = (2 * NIR + 1 - sqrt((2 * NIR + 1)^2 - 8 * (NIR - RED))) / 2
    msavi = (2 * nir_band + 1 - np.sqrt((2 * nir_band + 1)**2 - 8 * (nir_band - red_band))) / 2
    return msavi

def extract_sentinel2_bands(image_path):
    """
    Extract the relevant bands from a Sentinel-2 image
    
    Parameters:
    -----------
    image_path : str
        Path to the Sentinel-2 image
        
    Returns:
    --------
    bands : dict
        Dictionary with the extracted bands
    """
    with rasterio.open(image_path) as src:
        # Sentinel-2 bands we're interested in
        # Band 2 - Blue
        # Band 3 - Green
        # Band 4 - Red
        # Band 5 - Red Edge 1
        # Band 8 - NIR
        # Band 11 - SWIR 1
        bands = {
            'blue': src.read(2),
            'green': src.read(3),
            'red': src.read(4),
            'red_edge': src.read(5),
            'nir': src.read(8),
            'swir1': src.read(11)
        }
        
        # Also store the metadata
        bands['metadata'] = src.meta
        
    return bands

def create_spectral_indices(bands):
    """
    Calculate spectral indices from Sentinel-2 bands
    
    Parameters:
    -----------
    bands : dict
        Dictionary with the extracted bands
        
    Returns:
    --------
    indices : dict
        Dictionary with calculated spectral indices
    """
    indices = {}
    
    # Calculate NDVI
    indices['ndvi'] = calculate_ndvi(bands['nir'], bands['red'])
    
    # Calculate EVI
    indices['evi'] = calculate_evi(bands['nir'], bands['red'], bands['blue'])
    
    # Calculate MSAVI
    indices['msavi'] = calculate_msavi(bands['nir'], bands['red'])
    
    # Calculate Chlorophyll index
    indices['ci'] = (bands['nir'] / bands['red_edge']) - 1
    
    # Calculate SWIR/NIR ratio (useful for identifying plants with essential oils)
    indices['swir_nir_ratio'] = bands['swir1'] / bands['nir']
    
    return indices

def create_feature_stack(bands, indices):
    """
    Create a feature stack from bands and indices for machine learning
    
    Parameters:
    -----------
    bands : dict
        Dictionary with the extracted bands
    indices : dict
        Dictionary with calculated spectral indices
        
    Returns:
    --------
    feature_stack : numpy array
        Feature stack for machine learning
    """
    # Create a list of the band arrays and indices
    features = [
        bands['blue'],
        bands['green'],
        bands['red'],
        bands['red_edge'],
        bands['nir'],
        bands['swir1'],
        indices['ndvi'],
        indices['evi'],
        indices['msavi'],
        indices['ci'],
        indices['swir_nir_ratio']
    ]
    
    # Stack the arrays along a new axis
    feature_stack = np.stack(features, axis=0)
    
    # Reshape to (n_samples, n_features)
    # We need to reshape to (height*width, n_features)
    h, w = features[0].shape
    n_features = len(features)
    feature_stack = feature_stack.reshape(n_features, h * w).T
    
    return feature_stack

def train_rosemary_detector(feature_stack, training_areas):
    """
    Train a model to detect rosemary (Lavandula stoechas)
    
    Parameters:
    -----------
    feature_stack : numpy array
        Feature stack for machine learning
    training_areas : GeoDataFrame
        GeoDataFrame with training areas (polygons with class labels)
        
    Returns:
    --------
    model : RandomForestClassifier
        Trained model
    """
    # Extract training data from the feature stack using the training areas
    # This is a simplified version and would need to be adapted to your specific data
    # In a real implementation, you would need to extract the pixels corresponding to
    # the training areas from the feature stack
    
    # Placeholder for illustration
    # In a real implementation, you would extract the actual training data
    X_train = feature_stack[:1000]  # Just use the first 1000 pixels for demonstration
    y_train = np.random.randint(0, 2, size=1000)  # Random labels for demonstration
    
    # Split the data into training and validation sets
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )
    
    # Create and train the model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=None,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    conf_matrix = confusion_matrix(y_val, y_pred)
    class_report = classification_report(y_val, y_pred)
    
    print(f"Model accuracy: {accuracy:.4f}")
    print("Confusion matrix:")
    print(conf_matrix)
    print("Classification report:")
    print(class_report)
    
    return model

def detect_rosemary(image_path, model_path=None, output_path=None):
    """
    Detect rosemary in a Sentinel-2 image
    
    Parameters:
    -----------
    image_path : str
        Path to the Sentinel-2 image
    model_path : str, optional
        Path to the trained model
    output_path : str, optional
        Path to save the detection result
        
    Returns:
    --------
    detection_result : numpy array
        Array with detection results (0: background, 1: rosemary)
    """
    # Extract bands and indices
    bands = extract_sentinel2_bands(image_path)
    indices = create_spectral_indices(bands)
    feature_stack = create_feature_stack(bands, indices)
    
    # Load the model if provided
    if model_path:
        from flora_detection.models import load_model
        model = load_model(model_path)
    else:
        # Use a simple threshold on NDVI for demonstration
        print("No model provided, using NDVI threshold for demonstration")
        
        # Reshape indices['ndvi'] to match feature_stack shape (pixels, features)
        h, w = indices['ndvi'].shape
        detection_result = np.zeros((h, w), dtype=np.int32)
        
        # Simple thresholding based on NDVI and SWIR/NIR ratio
        # These thresholds are just examples and would need to be adjusted
        # for real-world applications
        rosemary_mask = (
            (indices['ndvi'] > 0.3) &  # Healthy vegetation
            (indices['ndvi'] < 0.7) &  # Not too dense forest
            (indices['swir_nir_ratio'] > 0.4) &  # Characteristic of certain plants
            (indices['swir_nir_ratio'] < 0.7)
        )
        detection_result[rosemary_mask] = 1  # Class 1: rosemary
        
        # Save the result if output_path is provided
        if output_path:
            plt.figure(figsize=(10, 10))
            plt.imshow(detection_result, cmap='viridis')
            plt.colorbar(label='Class')
            plt.title('Rosemary Detection Result')
            plt.savefig(output_path)
            plt.close()
        
        return detection_result
    
    # Predict using the loaded model
    detection_result = model.predict(feature_stack)
    
    # Reshape the result back to image shape
    h, w = bands['red'].shape
    detection_result = detection_result.reshape(h, w)
    
    # Save the result if output_path is provided
    if output_path:
        plt.figure(figsize=(10, 10))
        plt.imshow(detection_result, cmap='viridis')
        plt.colorbar(label='Class')
        plt.title('Rosemary Detection Result')
        plt.savefig(output_path)
        plt.close()
    
    return detection_result

def plot_detection_results(original_image, detection_result, output_path=None):
    """
    Plot the original image and detection result
    
    Parameters:
    -----------
    original_image : numpy array
        Original RGB image
    detection_result : numpy array
        Detection result
    output_path : str, optional
        Path to save the plot
    """
    plt.figure(figsize=(15, 8))
    
    # Plot original image
    plt.subplot(1, 2, 1)
    plt.imshow(original_image)
    plt.title('Original Image')
    plt.axis('off')
    
    # Plot detection result
    plt.subplot(1, 2, 2)
    plt.imshow(detection_result, cmap='viridis')
    plt.colorbar(label='Class')
    plt.title('Rosemary Detection')
    plt.axis('off')
    
    plt.tight_layout()
    
    # Save the plot if output_path is provided
    if output_path:
        plt.savefig(output_path)
        plt.close()
    else:
        plt.show()
