"""
Geographic Convolutional Neural Networks for flora detection using Sentinel-2 imagery
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
import rasterio
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import earthpy.plot as ep

class GeoCNN:
    """
    Geographic Convolutional Neural Network for flora detection
    
    This model is specifically designed to analyze Sentinel-2 multispectral imagery
    and identify key melliferous flora species like rosemary, heather, eucalyptus, etc.
    """
    
    def __init__(self, input_shape=(10, 64, 64), num_classes=4, learning_rate=0.001):
        """
        Initialize the GeoNN model
        
        Parameters:
        -----------
        input_shape : tuple, default=(10, 64, 64)
            Shape of input patches (channels, height, width)
            Default assumes 10 spectral bands/indices from Sentinel-2
        num_classes : int, default=4
            Number of classes to predict (e.g., background, rosemary, heather, eucalyptus)
        learning_rate : float, default=0.001
            Learning rate for the optimizer
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.learning_rate = learning_rate
        self.model = self._build_model()
        
    def _build_model(self):
        """
        Build the CNN model architecture
        
        Returns:
        --------
        model : tensorflow.keras.Model
            Compiled CNN model
        """
        # Define input shape (channels, height, width)
        # For Sentinel-2, we typically have multiple bands and derived indices
        input_layer = layers.Input(shape=self.input_shape)
        
        # Transpose to (height, width, channels) for TensorFlow
        x = layers.Permute((2, 3, 1))(input_layer)
        
        # First convolutional block
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Second convolutional block
        x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Third convolutional block with atrous convolution (dilated) to capture wider context
        x = layers.Conv2D(256, (3, 3), activation='relu', padding='same', dilation_rate=(2, 2))(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Global features
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        
        # Classification head
        output_layer = layers.Dense(self.num_classes, activation='softmax')(x)
        
        # Create and compile model
        model = models.Model(inputs=input_layer, outputs=output_layer)
        model.compile(
            optimizer=optimizers.Adam(learning_rate=self.learning_rate),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def create_unet_segmentation(self):
        """
        Create a U-Net model for pixel-wise segmentation of flora
        
        Returns:
        --------
        model : tensorflow.keras.Model
            Compiled U-Net model for segmentation
        """
        # Input shape (channels, height, width)
        input_layer = layers.Input(shape=self.input_shape)
        
        # Transpose to (height, width, channels) for TensorFlow
        x = layers.Permute((2, 3, 1))(input_layer)
        
        # Encoder
        conv1 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        conv1 = layers.BatchNormalization()(conv1)
        conv1 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(conv1)
        conv1 = layers.BatchNormalization()(conv1)
        pool1 = layers.MaxPooling2D(pool_size=(2, 2))(conv1)
        
        conv2 = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(pool1)
        conv2 = layers.BatchNormalization()(conv2)
        conv2 = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(conv2)
        conv2 = layers.BatchNormalization()(conv2)
        pool2 = layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        conv3 = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(pool2)
        conv3 = layers.BatchNormalization()(conv3)
        conv3 = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(conv3)
        conv3 = layers.BatchNormalization()(conv3)
        pool3 = layers.MaxPooling2D(pool_size=(2, 2))(conv3)
        
        # Bridge
        conv4 = layers.Conv2D(512, (3, 3), activation='relu', padding='same')(pool3)
        conv4 = layers.BatchNormalization()(conv4)
        conv4 = layers.Conv2D(512, (3, 3), activation='relu', padding='same')(conv4)
        conv4 = layers.BatchNormalization()(conv4)
        
        # Decoder
        up5 = layers.UpSampling2D(size=(2, 2))(conv4)
        up5 = layers.Conv2D(256, (2, 2), activation='relu', padding='same')(up5)
        merge5 = layers.concatenate([conv3, up5], axis=3)
        conv5 = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(merge5)
        conv5 = layers.BatchNormalization()(conv5)
        conv5 = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(conv5)
        conv5 = layers.BatchNormalization()(conv5)
        
        up6 = layers.UpSampling2D(size=(2, 2))(conv5)
        up6 = layers.Conv2D(128, (2, 2), activation='relu', padding='same')(up6)
        merge6 = layers.concatenate([conv2, up6], axis=3)
        conv6 = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(merge6)
        conv6 = layers.BatchNormalization()(conv6)
        conv6 = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(conv6)
        conv6 = layers.BatchNormalization()(conv6)
        
        up7 = layers.UpSampling2D(size=(2, 2))(conv6)
        up7 = layers.Conv2D(64, (2, 2), activation='relu', padding='same')(up7)
        merge7 = layers.concatenate([conv1, up7], axis=3)
        conv7 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(merge7)
        conv7 = layers.BatchNormalization()(conv7)
        conv7 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(conv7)
        conv7 = layers.BatchNormalization()(conv7)
        
        # Output layer - pixel-wise classification
        output_layer = layers.Conv2D(self.num_classes, (1, 1), activation='softmax')(conv7)
        
        # Create and compile model
        model = models.Model(inputs=input_layer, outputs=output_layer)
        model.compile(
            optimizer=optimizers.Adam(learning_rate=self.learning_rate),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.segmentation_model = model
        return model
    
    def prepare_sentinel_data(self, sentinel_image_path, patch_size=64, overlap=0.5, max_patches=1000):
        """
        Prepare Sentinel-2 data for model training or prediction
        
        Parameters:
        -----------
        sentinel_image_path : str
            Path to the Sentinel-2 image
        patch_size : int, default=64
            Size of patches to extract from the image
        overlap : float, default=0.5
            Overlap ratio between adjacent patches
        max_patches : int, default=1000
            Maximum number of patches to extract
            
        Returns:
        --------
        patches : numpy array
            Extracted patches with shape (n_patches, channels, height, width)
        """
        from .utils import extract_sentinel2_bands, create_spectral_indices, create_feature_stack
        
        # Extract bands
        bands = extract_sentinel2_bands(sentinel_image_path)
        
        # Calculate indices
        indices = create_spectral_indices(bands)
        
        # Create feature stack
        feature_stack = np.stack([
            bands['blue'], 
            bands['green'], 
            bands['red'], 
            bands['red_edge'], 
            bands['nir'],
            bands['swir1'],
            indices['ndvi'],
            indices['evi'],
            indices['msavi'],
            indices['swir_nir_ratio']
        ], axis=0)
        
        # Get dimensions
        n_channels, height, width = feature_stack.shape
        
        # Calculate stride based on overlap
        stride = int(patch_size * (1 - overlap))
        
        # Initialize list to store patches
        patches = []
        
        # Extract patches
        for y in range(0, height - patch_size + 1, stride):
            for x in range(0, width - patch_size + 1, stride):
                # Extract patch
                patch = feature_stack[:, y:y+patch_size, x:x+patch_size]
                patches.append(patch)
                
                # Stop if we reached max_patches
                if len(patches) >= max_patches:
                    break
            if len(patches) >= max_patches:
                break
        
        # Convert to numpy array
        patches = np.array(patches)
        
        return patches
    
    def train(self, X_train, y_train, validation_split=0.2, batch_size=32, epochs=50, callbacks_list=None):
        """
        Train the model
        
        Parameters:
        -----------
        X_train : numpy array
            Training data with shape (n_samples, channels, height, width)
        y_train : numpy array
            Training labels with shape (n_samples,)
        validation_split : float, default=0.2
            Fraction of the training data to be used as validation
        batch_size : int, default=32
            Batch size for training
        epochs : int, default=50
            Number of epochs to train
        callbacks_list : list, default=None
            List of keras callbacks for training
            
        Returns:
        --------
        history : tensorflow.keras.callbacks.History
            Training history
        """
        if callbacks_list is None:
            callbacks_list = [
                callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=10,
                    restore_best_weights=True
                ),
                callbacks.ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-6
                )
            ]
        
        # Train the model
        history = self.model.fit(
            X_train,
            y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_split=validation_split,
            callbacks=callbacks_list
        )
        
        return history
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate the model
        
        Parameters:
        -----------
        X_test : numpy array
            Test data with shape (n_samples, channels, height, width)
        y_test : numpy array
            Test labels with shape (n_samples,)
            
        Returns:
        --------
        evaluation : dict
            Dictionary with evaluation metrics
        """
        # Evaluate the model
        loss, accuracy = self.model.evaluate(X_test, y_test)
        
        # Generate predictions
        y_pred = self.model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        # Calculate additional metrics
        report = classification_report(y_test, y_pred_classes, output_dict=True)
        conf_matrix = confusion_matrix(y_test, y_pred_classes)
        
        # Create evaluation dictionary
        evaluation = {
            'loss': loss,
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': conf_matrix
        }
        
        return evaluation
    
    def predict_image(self, sentinel_image_path, output_path=None, visualize=True):
        """
        Predict flora distribution in a Sentinel-2 image
        
        Parameters:
        -----------
        sentinel_image_path : str
            Path to the Sentinel-2 image
        output_path : str, default=None
            Path to save the prediction result
        visualize : bool, default=True
            Whether to visualize the result
            
        Returns:
        --------
        prediction : numpy array
            Prediction result with shape (height, width)
        """
        from .utils import extract_sentinel2_bands, create_spectral_indices
        
        # Extract bands
        bands = extract_sentinel2_bands(sentinel_image_path)
        
        # Get image dimensions
        height, width = bands['blue'].shape
        
        # Calculate indices
        indices = create_spectral_indices(bands)
        
        # Create feature stack
        feature_stack = np.stack([
            bands['blue'], 
            bands['green'], 
            bands['red'], 
            bands['red_edge'], 
            bands['nir'],
            bands['swir1'],
            indices['ndvi'],
            indices['evi'],
            indices['msavi'],
            indices['swir_nir_ratio']
        ], axis=0)
        
        # Prepare patches
        patches = self.prepare_sentinel_data(sentinel_image_path)
        
        # Predict on patches
        predictions = self.model.predict(patches)
        pred_classes = np.argmax(predictions, axis=1)
        
        # Reconstruct full image prediction (placeholder - would need more complex logic for actual implementation)
        # This is simplified and would need adjustment for actual patch reconstruction
        prediction = np.zeros((height, width), dtype=np.uint8)
        
        # For visualization, create a RGB composite
        rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=2)
        rgb = (rgb - rgb.min()) / (rgb.max() - rgb.min())
        
        if visualize:
            fig, axs = plt.subplots(1, 3, figsize=(18, 6))
            
            # Plot RGB image
            axs[0].imshow(rgb)
            axs[0].set_title('RGB Composite')
            axs[0].axis('off')
            
            # Plot NDVI
            ndvi_display = indices['ndvi']
            ndvi_display = np.clip(ndvi_display, -1, 1)
            axs[1].imshow(ndvi_display, cmap='RdYlGn', vmin=-1, vmax=1)
            axs[1].set_title('NDVI (Vegetation Index)')
            axs[1].axis('off')
            
            # Plot sample predictions on patches
            # This is a placeholder - would need actual reconstruction for full image
            sample_pred = np.zeros((height, width, 3), dtype=np.uint8)
            # Assign colors to each class (example: background=black, rosemary=red, heather=green, eucalyptus=blue)
            class_colors = np.array([[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255]])
            
            axs[2].imshow(sample_pred)
            axs[2].set_title('Flora Detection')
            axs[2].axis('off')
            
            plt.tight_layout()
            
            if output_path:
                plt.savefig(output_path, dpi=300)
                plt.close()
            else:
                plt.show()
        
        return prediction
    
    def save(self, model_path):
        """
        Save the model
        
        Parameters:
        -----------
        model_path : str
            Path to save the model
        """
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save the model
        self.model.save(model_path)
        print(f"Model saved to {model_path}")
    
    @classmethod
    def load(cls, model_path):
        """
        Load a saved model
        
        Parameters:
        -----------
        model_path : str
            Path to the saved model
            
        Returns:
        --------
        geo_cnn : GeoNN
            Loaded model
        """
        # Create an instance without building a model
        geo_cnn = cls(input_shape=(10, 64, 64), num_classes=4)
        
        # Load the saved model
        geo_cnn.model = models.load_model(model_path)
        
        return geo_cnn


def calculate_vegetation_health(ndvi_array):
    """
    Calculate vegetation health based on NDVI values
    
    Parameters:
    -----------
    ndvi_array : numpy array
        Array of NDVI values
        
    Returns:
    --------
    health : dict
        Dictionary with vegetation health metrics
    """
    # Define NDVI thresholds for health categories
    thresholds = {
        'unhealthy': 0.2,
        'moderate': 0.4,
        'healthy': 0.6,
        'very_healthy': 0.8
    }
    
    # Calculate percentage in each category
    health = {
        'unhealthy': np.sum((ndvi_array > 0) & (ndvi_array < thresholds['unhealthy'])) / np.sum(ndvi_array > 0) * 100,
        'moderate': np.sum((ndvi_array >= thresholds['unhealthy']) & (ndvi_array < thresholds['moderate'])) / np.sum(ndvi_array > 0) * 100,
        'healthy': np.sum((ndvi_array >= thresholds['moderate']) & (ndvi_array < thresholds['healthy'])) / np.sum(ndvi_array > 0) * 100,
        'very_healthy': np.sum((ndvi_array >= thresholds['healthy']) & (ndvi_array < thresholds['very_healthy'])) / np.sum(ndvi_array > 0) * 100,
        'exceptional': np.sum(ndvi_array >= thresholds['very_healthy']) / np.sum(ndvi_array > 0) * 100
    }
    
    # Calculate average NDVI for vegetated areas
    health['average_ndvi'] = np.mean(ndvi_array[ndvi_array > 0])
    
    return health


def estimate_flowering_stage(ndvi_array, evi_array, date_str):
    """
    Estimate flowering stage based on spectral indices and date
    
    Parameters:
    -----------
    ndvi_array : numpy array
        Array of NDVI values
    evi_array : numpy array
        Array of EVI values
    date_str : str
        Date of the image in format 'YYYY-MM-DD'
        
    Returns:
    --------
    flowering : dict
        Dictionary with flowering stage metrics
    """
    import datetime
    
    # Parse date
    date = datetime.datetime.strptime(date_str, '%Y-%m-%d')
    
    # Define seasons for Portugal/Spain (adjust as needed)
    seasons = {
        'spring': (datetime.datetime(date.year, 3, 21), datetime.datetime(date.year, 6, 20)),
        'summer': (datetime.datetime(date.year, 6, 21), datetime.datetime(date.year, 9, 22)),
        'fall': (datetime.datetime(date.year, 9, 23), datetime.datetime(date.year, 12, 20)),
        'winter': (datetime.datetime(date.year, 12, 21), datetime.datetime(date.year, 3, 20))
    }
    
    # Determine current season
    current_season = None
    for season, (start, end) in seasons.items():
        if start <= date <= end:
            current_season = season
            break
    
    # If date is in winter but before year end
    if current_season is None and date.month >= 12:
        current_season = 'winter'
    
    # Define flowering stages for different species by season
    flowering_stages = {
        'rosemary': {
            'spring': 'peak',
            'summer': 'end',
            'fall': 'vegetative',
            'winter': 'early'
        },
        'heather': {
            'spring': 'vegetative',
            'summer': 'early',
            'fall': 'peak',
            'winter': 'end'
        },
        'eucalyptus': {
            'spring': 'early',
            'summer': 'peak',
            'fall': 'end',
            'winter': 'vegetative'
        }
    }
    
    # Estimate flowering percentages based on NDVI/EVI patterns
    # This is a simplified approach - in reality would need species-specific models
    flowering_percent = {
        'vegetative': 0,
        'early': 30,
        'peak': 100,
        'end': 50
    }
    
    # Return flowering information
    flowering = {
        'season': current_season,
        'species_stage': {
            species: {
                'stage': stage,
                'flowering_percent': flowering_percent[stage]
            }
            for species, stages in flowering_stages.items()
            for stage_season, stage in stages.items()
            if stage_season == current_season
        }
    }
    
    return flowering 