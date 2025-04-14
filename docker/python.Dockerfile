FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir .

# Copy Python code
COPY python/ ./python/

# Run the Python application
CMD ["python", "python/main.py"] 