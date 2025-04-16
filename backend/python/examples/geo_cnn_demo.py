#!/usr/bin/env python3
"""
Demo script for the GeoCNN module for flora detection using Sentinel-2 imagery
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flora_detection.geo_cnn import GeoCNN, calculate_vegetation_health, estimate_flowering_stage
from flora_detection.utils import extract_sentinel2_bands, create_spectral_indices

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='GeoCNN Demo for Flora Detection')
    
    # Input/output files
    parser.add_argument('--input', type=str, required=True,
                        help='Path to Sentinel-2 image')
    parser.add_argument('--output-dir', type=str, default='./output',
                        help='Directory to save output files')
    parser.add_argument('--model', type=str, default=None,
                        help='Path to pre-trained model (if None, a new model will be created)')
    
    # Model parameters
    parser.add_argument('--patch-size', type=int, default=64,
                        help='Size of image patches for analysis')
    parser.add_argument('--num-classes', type=int, default=4,
                        help='Number of classes to predict')
    
    # Training parameters (used if --train flag is set)
    parser.add_argument('--train', action='store_true',
                        help='Train the model on the input data')
    parser.add_argument('--epochs', type=int, default=50,
                        help='Number of epochs for training')
    parser.add_argument('--batch-size', type=int, default=32,
                        help='Batch size for training')
    
    # Additional analysis options
    parser.add_argument('--date', type=str, default=None,
                        help='Date of the image in format YYYY-MM-DD (for flowering stage estimation)')
    parser.add_argument('--detailed-report', action='store_true',
                        help='Generate a detailed report of analysis results')
    
    return parser.parse_args()

def main():
    """Main function"""
    # Parse command line arguments
    args = parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    print(f"Processing Sentinel-2 image: {args.input}")
    
    # Extract bands and indices from the Sentinel-2 image
    print("Extracting bands and calculating indices...")
    bands = extract_sentinel2_bands(args.input)
    indices = create_spectral_indices(bands)
    
    # Create a GeoCNN model
    if args.model is not None and os.path.exists(args.model):
        print(f"Loading pre-trained model from {args.model}")
        geo_cnn = GeoCNN.load(args.model)
    else:
        print("Creating a new GeoCNN model")
        input_channels = 10  # 6 bands + 4 indices
        geo_cnn = GeoCNN(
            input_shape=(input_channels, args.patch_size, args.patch_size),
            num_classes=args.num_classes
        )
    
    # Print model summary
    geo_cnn.model.summary()
    
    # Train the model if requested
    if args.train:
        print("Preparing training data...")
        # For a real implementation, we would need labeled data
        # This is a placeholder for demonstration purposes
        X_train = geo_cnn.prepare_sentinel_data(
            args.input,
            patch_size=args.patch_size
        )
        # Dummy labels for demonstration - in practice we would need real labels
        y_train = np.zeros(X_train.shape[0], dtype=np.int32)
        
        print(f"Training model on {X_train.shape[0]} patches for {args.epochs} epochs...")
        history = geo_cnn.train(
            X_train,
            y_train,
            batch_size=args.batch_size,
            epochs=args.epochs
        )
        
        # Plot training history
        plt.figure(figsize=(12, 4))
        plt.subplot(1, 2, 1)
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        plt.tight_layout()
        plt.savefig(os.path.join(args.output_dir, 'training_history.png'))
        
        # Save the model
        model_output_path = os.path.join(args.output_dir, 'geo_cnn_model.h5')
        geo_cnn.save(model_output_path)
        print(f"Model saved to {model_output_path}")
    
    # Predict flora distribution
    print("Predicting flora distribution...")
    prediction_output_path = os.path.join(args.output_dir, 'flora_prediction.png')
    prediction = geo_cnn.predict_image(
        args.input,
        output_path=prediction_output_path,
        visualize=True
    )
    print(f"Prediction saved to {prediction_output_path}")
    
    # Calculate vegetation health based on NDVI
    print("Calculating vegetation health metrics...")
    health_metrics = calculate_vegetation_health(indices['ndvi'])
    
    # Estimate flowering stage if date is provided
    if args.date:
        print(f"Estimating flowering stage for date {args.date}...")
        flowering_info = estimate_flowering_stage(
            indices['ndvi'],
            indices['evi'],
            args.date
        )
    else:
        flowering_info = None
    
    # Generate a detailed report if requested
    if args.detailed_report:
        print("Generating detailed report...")
        # Create a figure with multiple subplots for the report
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
            ax5.set_ylabel('Flowering %')
            ax5.set_ylim(0, 100)
        else:
            ax5.text(0.5, 0.5, 'No flowering info available', 
                   ha='center', va='center', fontsize=12)
            ax5.set_title('Flowering Stage')
            ax5.axis('off')
        
        # 6. Prediction results
        ax6 = fig.add_subplot(2, 3, 6)
        cmap = plt.cm.get_cmap('viridis', args.num_classes)
        im = ax6.imshow(prediction, cmap=cmap, vmin=0, vmax=args.num_classes-1)
        plt.colorbar(im, ax=ax6, label='Class')
        
        # Set custom labels for the colorbar
        class_names = ['Background', 'Rosemary', 'Other vegetation', 'Mixed']
        if args.num_classes <= len(class_names):
            plt.colorbar(im, ax=ax6, ticks=range(args.num_classes), label='Class') \
                .set_ticklabels(class_names[:args.num_classes])
        
        ax6.set_title('Flora Distribution')
        ax6.axis('off')
        
        plt.tight_layout()
        report_output_path = os.path.join(args.output_dir, 'detailed_report.png')
        plt.savefig(report_output_path, dpi=300)
        plt.close(fig)
        print(f"Detailed report saved to {report_output_path}")
        
        # Save analysis results as JSON
        import json
        
        analysis_results = {
            'health_metrics': health_metrics,
            'flowering_info': flowering_info,
            'prediction_stats': {
                'num_classes': args.num_classes,
                'class_distribution': {
                    str(i): int(np.sum(prediction == i)) 
                    for i in range(args.num_classes)
                }
            },
            'metadata': {
                'image_path': args.input,
                'date': args.date,
                'analysis_date': datetime.now().isoformat()
            }
        }
        
        json_output_path = os.path.join(args.output_dir, 'analysis_results.json')
        with open(json_output_path, 'w') as f:
            json.dump(analysis_results, f, indent=4)
        print(f"Analysis results saved to {json_output_path}")
    
    print("Analysis complete!")

if __name__ == "__main__":
    main() 