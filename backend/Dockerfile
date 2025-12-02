FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
# libgl1-mesa-glx is not needed for opencv-python-headless, but libglib2.0-0 is often required
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download SAM model during build to bake it into image
# Using ViT-B (smallest ~375MB)
RUN wget -q https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth -O sam_vit_b_01ec64.pth

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

