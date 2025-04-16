"""
Machine learning models for flora detection
"""

import os
import pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

def create_rf_model(n_estimators=100, max_depth=None, random_state=42):
    """
    Create a Random Forest classifier
    
    Parameters:
    -----------
    n_estimators : int, default=100
        Number of trees in the forest
    max_depth : int, default=None
        Maximum depth of the trees
    random_state : int, default=42
        Random state for reproducibility
        
    Returns:
    --------
    model : RandomForestClassifier
        Random Forest classifier
    """
    return RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_state
    )

def create_svm_model(kernel='rbf', C=1.0, gamma='scale', random_state=42):
    """
    Create a Support Vector Machine classifier
    
    Parameters:
    -----------
    kernel : str, default='rbf'
        Kernel type
    C : float, default=1.0
        Regularization parameter
    gamma : str or float, default='scale'
        Kernel coefficient
    random_state : int, default=42
        Random state for reproducibility
        
    Returns:
    --------
    model : SVC
        Support Vector Machine classifier
    """
    return SVC(
        kernel=kernel,
        C=C,
        gamma=gamma,
        random_state=random_state,
        probability=True
    )

def create_cnn_model(input_shape, num_classes=3):
    """
    Create a Convolutional Neural Network for image classification
    
    Parameters:
    -----------
    input_shape : tuple
        Shape of the input data (height, width, channels)
    num_classes : int, default=3
        Number of classes (background, rosemary, other vegetation)
        
    Returns:
    --------
    model : tensorflow.keras.Model
        CNN model
    """
    model = models.Sequential([
        # First convolutional block
        layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        # Second convolutional block
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        # Third convolutional block
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        # Dense layers
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile the model
    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def save_model(model, model_path, model_type='sklearn'):
    """
    Save a trained model to disk
    
    Parameters:
    -----------
    model : object
        Trained model
    model_path : str
        Path to save the model
    model_type : str, default='sklearn'
        Type of model ('sklearn' or 'tensorflow')
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    if model_type == 'sklearn':
        # Save scikit-learn model
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
    elif model_type == 'tensorflow':
        # Save TensorFlow model
        model.save(model_path)
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    print(f"Model saved to {model_path}")

def load_model(model_path, model_type='sklearn'):
    """
    Load a trained model from disk
    
    Parameters:
    -----------
    model_path : str
        Path to the model
    model_type : str, default='sklearn'
        Type of model ('sklearn' or 'tensorflow')
        
    Returns:
    --------
    model : object
        Trained model
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    if model_type == 'sklearn':
        # Load scikit-learn model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    elif model_type == 'tensorflow':
        # Load TensorFlow model
        model = models.load_model(model_path)
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    return model
