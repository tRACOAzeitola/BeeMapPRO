"""
Flora detection package for BeeMap Pro
"""

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