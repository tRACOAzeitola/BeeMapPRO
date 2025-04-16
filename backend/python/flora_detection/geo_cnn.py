"""
GeoCNN module for flora detection using CNN with geospatial data
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
import matplotlib.pyplot as plt
import rasterio
from rasterio.windows import Window
from datetime import datetime
import random

class GeoCNN:
    """
    Geographic Convolutional Neural Network for flora detection
    """
    
    def __init__(self, input_shape, num_classes=4):
        """
        Initialize a GeoCNN model
        
        Parameters:
        -----------
        input_shape : tuple
            Shape of the input data (channels, height, width)
        num_classes : int, default=4
            Number of classes to predict
            0: Background
            1: Rosemary
            2: Other vegetation
            3: Mixed
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        
        # Create the model
        self.model = self._create_model()
        
    def _create_model(self):
        """
        Create the CNN model
        
        Returns:
        --------
        model : tensorflow.keras.Model
            CNN model
        """
        # Reshape input shape to (height, width, channels) for TF
        input_shape_tf = (self.input_shape[1], self.input_shape[2], self.input_shape[0])
        
        model = models.Sequential([
            # First convolutional block
            layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_shape_tf),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Second convolutional block
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Third convolutional block
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Dense layers
            layers.Flatten(),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        # Compile the model
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(self, X_train, y_train, batch_size=32, epochs=50, validation_split=0.2):
        """
        Train the model
        
        Parameters:
        -----------
        X_train : numpy array
            Training data
        y_train : numpy array
            Training labels
        batch_size : int, default=32
            Batch size for training
        epochs : int, default=50
            Number of epochs for training
        validation_split : float, default=0.2
            Fraction of training data to use for validation
            
        Returns:
        --------
        history : History object
            Training history
        """
        # Data augmentation
        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            validation_split=validation_split
        )
        
        # Split data into training and validation
        split_idx = int(X_train.shape[0] * (1 - validation_split))
        X_train_split = X_train[:split_idx]
        y_train_split = y_train[:split_idx]
        X_val = X_train[split_idx:]
        y_val = y_train[split_idx:]
        
        # Create data generators
        train_generator = datagen.flow(
            X_train_split,
            y_train_split,
            batch_size=batch_size
        )
        
        # Callbacks for training
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10
            ),
            callbacks.ModelCheckpoint(
                filepath='geo_cnn_checkpoint.h5',
                monitor='val_loss',
                save_best_only=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.1,
                patience=5
            )
        ]
        
        # Train the model
        history = self.model.fit(
            train_generator,
            epochs=epochs,
            validation_data=(X_val, y_val),
            callbacks=callbacks_list
        )
        
        return history
    
    def predict(self, X):
        """
        Make predictions with the model
        
        Parameters:
        -----------
        X : numpy array
            Input data
            
        Returns:
        --------
        predictions : numpy array
            Predicted classes
        """
        return self.model.predict(X)
    
    def save(self, model_path):
        """
        Save the model to disk
        
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
        Load a trained model from disk
        
        Parameters:
        -----------
        model_path : str
            Path to the model
            
        Returns:
        --------
        geo_cnn : GeoCNN
            Loaded GeoCNN model
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Load the model
        model = models.load_model(model_path)
        
        # Create a GeoCNN instance
        input_shape = model.input_shape[1:]  # Skip batch dimension
        num_classes = model.output_shape[1]
        
        # Create a GeoCNN instance with the loaded model
        geo_cnn = cls(
            input_shape=(input_shape[2], input_shape[0], input_shape[1]),
            num_classes=num_classes
        )
        geo_cnn.model = model
        
        return geo_cnn
    
    def prepare_sentinel_data(self, image_path, patch_size=64, stride=32):
        """
        Prepare Sentinel-2 image data for the model
        
        Parameters:
        -----------
        image_path : str
            Path to the Sentinel-2 image
        patch_size : int, default=64
            Size of image patches
        stride : int, default=32
            Stride for extracting patches
            
        Returns:
        --------
        patches : numpy array
            Extracted patches
        """
        from flora_detection.utils import extract_sentinel2_bands, create_spectral_indices
        
        # Extract bands and indices
        bands = extract_sentinel2_bands(image_path)
        indices = create_spectral_indices(bands)
        
        # Create feature stack
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
            indices['ci']
        ]
        
        # Stack the arrays along a new axis
        feature_stack = np.stack(features, axis=0)
        
        # Extract patches
        patches = []
        h, w = feature_stack.shape[1], feature_stack.shape[2]
        
        for i in range(0, h - patch_size + 1, stride):
            for j in range(0, w - patch_size + 1, stride):
                patch = feature_stack[:, i:i+patch_size, j:j+patch_size]
                patches.append(patch)
        
        # Convert to numpy array and reshape for TensorFlow (channels last)
        patches = np.array(patches)
        patches = np.transpose(patches, (0, 2, 3, 1))
        
        return patches
    
    def predict_image(self, image_path, output_path=None, patch_size=64, stride=32, visualize=False):
        """
        Predict flora distribution in a Sentinel-2 image
        
        Parameters:
        -----------
        image_path : str
            Path to the Sentinel-2 image
        output_path : str, optional
            Path to save the prediction
        patch_size : int, default=64
            Size of image patches
        stride : int, default=32
            Stride for extracting patches
        visualize : bool, default=False
            Whether to visualize the prediction
            
        Returns:
        --------
        prediction : numpy array
            Predicted flora distribution
        """
        from flora_detection.utils import extract_sentinel2_bands, create_spectral_indices
        
        # Extract bands and indices
        bands = extract_sentinel2_bands(image_path)
        indices = create_spectral_indices(bands)
        
        # Get image dimensions
        h, w = bands['red'].shape
        
        # Create feature stack
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
            indices['ci']
        ]
        
        # Stack the arrays along a new axis
        feature_stack = np.stack(features, axis=0)
        
        # Extract patches
        patches = []
        patch_indices = []
        
        for i in range(0, h - patch_size + 1, stride):
            for j in range(0, w - patch_size + 1, stride):
                patch = feature_stack[:, i:i+patch_size, j:j+patch_size]
                patches.append(patch)
                patch_indices.append((i, j))
        
        # Convert to numpy array and reshape for TensorFlow (channels last)
        patches = np.array(patches)
        patches = np.transpose(patches, (0, 2, 3, 1))
        
        # Predict
        predictions = self.model.predict(patches)
        
        # Class with highest probability
        class_predictions = np.argmax(predictions, axis=1)
        
        # Create output image
        output = np.zeros((h, w), dtype=np.int32)
        
        # Fill output image
        for (i, j), pred in zip(patch_indices, class_predictions):
            # Use a weighted approach to fill the output image
            # This helps with overlapping patches
            for di in range(patch_size):
                for dj in range(patch_size):
                    if 0 <= i + di < h and 0 <= j + dj < w:
                        # Weight by distance from center of patch
                        weight = 1.0 - (abs(di - patch_size/2) + abs(dj - patch_size/2)) / patch_size
                        if output[i + di, j + dj] == 0 or weight > 0.5:
                            output[i + di, j + dj] = pred
        
        # Visualize the prediction if requested
        if visualize:
            # Create RGB image
            rgb = np.stack([bands['red'], bands['green'], bands['blue']], axis=2)
            rgb = (rgb - rgb.min()) / (rgb.max() - rgb.min())
            
            # Create figure
            plt.figure(figsize=(15, 10))
            
            # Plot RGB image
            plt.subplot(1, 2, 1)
            plt.imshow(rgb)
            plt.title('RGB Composite')
            plt.axis('off')
            
            # Plot prediction
            plt.subplot(1, 2, 2)
            cmap = plt.cm.get_cmap('viridis', self.num_classes)
            plt.imshow(output, cmap=cmap, vmin=0, vmax=self.num_classes-1)
            plt.colorbar(ticks=range(self.num_classes), label='Class')
            
            # Set custom labels for the colorbar
            class_names = ['Background', 'Rosemary', 'Other vegetation', 'Mixed']
            if self.num_classes <= len(class_names):
                plt.colorbar(ticks=range(self.num_classes), label='Class') \
                    .set_ticklabels(class_names[:self.num_classes])
            
            plt.title('Flora Distribution')
            plt.axis('off')
            
            plt.tight_layout()
            
            # Save the figure if output_path is provided
            if output_path:
                plt.savefig(output_path, dpi=300)
                plt.close()
            else:
                plt.show()
        
        return output

def calculate_vegetation_health(ndvi):
    """
    Calculate vegetation health metrics based on NDVI
    
    Parameters:
    -----------
    ndvi : numpy array
        NDVI values
        
    Returns:
    --------
    health_metrics : dict
        Dictionary with vegetation health metrics
    """
    # Flatten and remove invalid values
    ndvi_flat = ndvi.flatten()
    ndvi_valid = ndvi_flat[(ndvi_flat >= -1) & (ndvi_flat <= 1)]
    
    # Calculate metrics
    metrics = {
        'min_ndvi': float(np.min(ndvi_valid)),
        'max_ndvi': float(np.max(ndvi_valid)),
        'average_ndvi': float(np.mean(ndvi_valid)),
        'median_ndvi': float(np.median(ndvi_valid)),
        'std_ndvi': float(np.std(ndvi_valid))
    }
    
    # Calculate percentage in each health category
    unhealthy = np.sum((ndvi_valid < 0.2)) / ndvi_valid.size * 100
    moderate = np.sum((ndvi_valid >= 0.2) & (ndvi_valid < 0.4)) / ndvi_valid.size * 100
    healthy = np.sum((ndvi_valid >= 0.4) & (ndvi_valid < 0.6)) / ndvi_valid.size * 100
    very_healthy = np.sum((ndvi_valid >= 0.6) & (ndvi_valid < 0.8)) / ndvi_valid.size * 100
    exceptional = np.sum((ndvi_valid >= 0.8)) / ndvi_valid.size * 100
    
    metrics['unhealthy'] = float(unhealthy)
    metrics['moderate'] = float(moderate)
    metrics['healthy'] = float(healthy)
    metrics['very_healthy'] = float(very_healthy)
    metrics['exceptional'] = float(exceptional)
    
    return metrics

def estimate_flowering_stage(ndvi, evi, date_str=None):
    """
    Estimate flowering stage based on vegetation indices and date
    
    Parameters:
    -----------
    ndvi : numpy array
        NDVI values
    evi : numpy array
        EVI values
    date_str : str, optional
        Date in format YYYY-MM-DD
        
    Returns:
    --------
    flowering_info : dict
        Dictionary with flowering stage information
    """
    # If no date is provided, use current date
    if date_str is None:
        date = datetime.now()
    else:
        date = datetime.strptime(date_str, '%Y-%m-%d')
    
    # Determine season
    month = date.month
    if 3 <= month <= 5:
        season = 'spring'
    elif 6 <= month <= 8:
        season = 'summer'
    elif 9 <= month <= 11:
        season = 'autumn'
    else:
        season = 'winter'
    
    # Flatten and remove invalid values
    ndvi_flat = ndvi.flatten()
    evi_flat = evi.flatten()
    
    ndvi_valid = ndvi_flat[(ndvi_flat >= -1) & (ndvi_flat <= 1)]
    evi_valid = evi_flat[(evi_flat >= -1) & (evi_flat <= 1)]
    
    # Calculate average values
    avg_ndvi = float(np.mean(ndvi_valid))
    avg_evi = float(np.mean(evi_valid))
    
    # Different plant species have different flowering seasons
    species_info = {
        'rosemary': {
            'spring': {
                'stage': 'peak' if avg_ndvi > 0.5 else 'early',
                'flowering_percent': 80 if avg_ndvi > 0.5 else 40
            },
            'summer': {
                'stage': 'late' if avg_ndvi > 0.4 else 'post',
                'flowering_percent': 30 if avg_ndvi > 0.4 else 10
            },
            'autumn': {
                'stage': 'dormant',
                'flowering_percent': 0
            },
            'winter': {
                'stage': 'pre' if month == 2 and avg_ndvi > 0.3 else 'dormant',
                'flowering_percent': 5 if month == 2 and avg_ndvi > 0.3 else 0
            }
        },
        'heather': {
            'spring': {
                'stage': 'pre',
                'flowering_percent': 10
            },
            'summer': {
                'stage': 'early' if month == 8 else 'pre',
                'flowering_percent': 30 if month == 8 else 10
            },
            'autumn': {
                'stage': 'peak' if month == 9 else 'late',
                'flowering_percent': 80 if month == 9 else 40
            },
            'winter': {
                'stage': 'dormant',
                'flowering_percent': 0
            }
        },
        'eucalyptus': {
            'spring': {
                'stage': 'dormant',
                'flowering_percent': 0
            },
            'summer': {
                'stage': 'dormant',
                'flowering_percent': 0
            },
            'autumn': {
                'stage': 'pre' if month == 11 else 'dormant',
                'flowering_percent': 10 if month == 11 else 0
            },
            'winter': {
                'stage': 'peak' if month == 12 or month == 1 else 'late',
                'flowering_percent': 70 if month == 12 or month == 1 else 30
            }
        }
    }
    
    # Return information
    return {
        'season': season,
        'average_ndvi': avg_ndvi,
        'average_evi': avg_evi,
        'species_stage': {
            species: info[season]
            for species, info in species_info.items()
        }
    }
