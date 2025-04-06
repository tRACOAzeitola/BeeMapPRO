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
    # Convert training areas to a raster mask with class labels
    # This step will depend on your specific data
    # For simplicity, let's assume we already have a mask with class labels
    # 0 = background, 1 = rosemary, 2 = other vegetation
    
    # This is a placeholder - in reality you'd create this from your GeoDataFrame
    class_mask = np.zeros((feature_stack.shape[0],), dtype=int)
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        feature_stack, class_mask, test_size=0.3, random_state=42
    )
    
    # Train a Random Forest classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred)
    
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
        Path to a pretrained model
    output_path : str, optional
        Path to save the detection results
        
    Returns:
    --------
    result : numpy array
        Array with rosemary detection results
    """
    # Extract bands
    bands = extract_sentinel2_bands(image_path)
    
    # Calculate indices
    indices = create_spectral_indices(bands)
    
    # Create feature stack
    feature_stack = create_feature_stack(bands, indices)
    
    # Load pretrained model if provided
    if model_path:
        # Load model from file
        # This is a placeholder - implement actual model loading
        model = None  # Replace with actual model loading
    else:
        # Train a new model (for demonstration)
        # In reality, you would use proper training data
        # This is just a placeholder to show the workflow
        print("No model provided. This would normally train a new model.")
        print("For demonstration only.")
        return None
    
    # Make predictions
    # This is a placeholder since we don't have a real model here
    h, w = bands['nir'].shape
    result = np.zeros((h, w), dtype=int)
    
    # Save results if output path is provided
    if output_path:
        # Save the results to a GeoTIFF with the same geospatial information as the input
        with rasterio.open(
            output_path, 
            'w',
            driver='GTiff',
            height=h,
            width=w,
            count=1,
            dtype=result.dtype,
            crs=bands['metadata']['crs'],
            transform=bands['metadata']['transform']
        ) as dst:
            dst.write(result, 1)
            
    return result

def plot_detection_results(original_image, detection_result, output_path=None):
    """
    Plot the detection results
    
    Parameters:
    -----------
    original_image : numpy array
        Original RGB image
    detection_result : numpy array
        Array with rosemary detection results
    output_path : str, optional
        Path to save the plot
    """
    fig, ax = plt.subplots(1, 2, figsize=(12, 6))
    
    # Plot the original image
    ax[0].imshow(original_image)
    ax[0].set_title('Original Image')
    ax[0].axis('off')
    
    # Plot the detection results
    # Create a colormap for the detection results
    # 0 = background (transparent)
    # 1 = rosemary (purple)
    # 2 = other vegetation (green)
    cmap = plt.cm.colors.ListedColormap(['none', 'purple', 'green'])
    bounds = [0, 0.5, 1.5, 2.5]
    norm = plt.cm.colors.BoundaryNorm(bounds, cmap.N)
    
    ax[1].imshow(original_image)  # background image
    im = ax[1].imshow(detection_result, cmap=cmap, norm=norm, alpha=0.7)
    ax[1].set_title('Rosemary Detection')
    ax[1].axis('off')
    
    # Add a colorbar
    cbar = fig.colorbar(im, ax=ax[1], ticks=[0, 1, 2])
    cbar.ax.set_yticklabels(['Background', 'Rosemary', 'Other vegetation'])
    
    plt.tight_layout()
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        
    plt.show()