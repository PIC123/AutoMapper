FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
# libglib2.0-0 is required for opencv-python-headless
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download MobileSAM model (approx 40MB) instead of original SAM (375MB+)
RUN wget -q https://github.com/ChaoningZhang/MobileSAM/raw/master/weights/mobile_sam.pt -O mobile_sam.pt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
