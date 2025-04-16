"""
Flora Detection Module

This module provides machine learning capabilities for detecting and 
classifying plant species relevant to beekeeping, with a special focus
on rosmaninho (lavender) detection from satellite imagery.
"""

__version__ = "1.0.0"

from .utils import (
    calculate_ndvi,
    calculate_evi,
    calculate_msavi,
    extract_sentinel2_bands,
    create_spectral_indices,
    create_feature_stack,
    train_rosemary_detector,
    detect_rosemary,
    plot_detection_results
)

__all__ = [
    'calculate_ndvi',
    'calculate_evi',
    'calculate_msavi',
    'extract_sentinel2_bands',
    'create_spectral_indices',
    'create_feature_stack',
    'train_rosemary_detector',
    'detect_rosemary',
    'plot_detection_results'
]
