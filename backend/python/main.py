"""
Main entry point for the Python backend
"""

import os
import sys
import argparse
from flora_detection.api import start_server

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='BeeMap Pro Python Backend')
    
    # Server configuration
    parser.add_argument('--host', type=str, default='0.0.0.0', 
                        help='Host to bind the server to')
    parser.add_argument('--port', type=int, default=5001, 
                        help='Port to bind the server to')
    
    # Model configuration
    parser.add_argument('--model-path', type=str, default='./models/rosemary_detector.pkl',
                        help='Path to the trained model')
    parser.add_argument('--model-type', type=str, default='sklearn', choices=['sklearn', 'tensorflow'],
                        help='Type of model')
    parser.add_argument('--threshold', type=float, default=0.5,
                        help='Threshold for detection')
    
    return parser.parse_args()

def main():
    """Main entry point"""
    # Parse command line arguments
    args = parse_args()
    
    # Set environment variables for configuration
    os.environ['MODEL_PATH'] = args.model_path
    os.environ['MODEL_TYPE'] = args.model_type
    os.environ['THRESHOLD'] = str(args.threshold)
    
    # Start the server
    print(f"Starting server on {args.host}:{args.port}")
    print(f"Using model: {args.model_path} ({args.model_type})")
    start_server(host=args.host, port=args.port)

if __name__ == '__main__':
    main() 