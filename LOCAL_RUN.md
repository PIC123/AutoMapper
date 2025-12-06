# AutoMapper - Local Run Guide

## 1. Backend Setup

1.  **Install Python Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2.  **Install SAM 2**:
    SAM 2 must be installed from Git (requires git installed):
    ```bash
    pip install git+https://github.com/facebookresearch/sam2.git
    ```
    *Note: If on Windows, you might need Visual Studio Build Tools C++ installed. If that fails, you can fall back to SAM 1 (step below).*

3.  **Download Model Weights**:
    
    **Option A: SAM 2 (Newer, Better)**
    Download: [sam2_hiera_large.pt](https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_large.pt)
    Save it to `backend/sam2_hiera_large.pt`.

    **Option B: SAM 1 (Easier Install)**
    Download: [sam_vit_h_4b8939.pth](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth)
    Save it to `backend/sam_vit_h_4b8939.pth`.

    *The code automatically detects which file is present and uses the appropriate library.*

4.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

## 2. Expose to Internet (for Mobile)

1.  **Install ngrok**: https://ngrok.com/download
2.  **Start Tunnel**:
    ```bash
    ngrok http 8000
    ```
    Copy the HTTPS URL.

## 3. Frontend Setup

1.  **Configure API URL**:
    *   Open `frontend/.env` (or create it).
    *   Add: `VITE_API_URL=https://<YOUR_NGROK_URL>`

2.  **Run Frontend**:
    ```bash
    cd frontend
    npm run dev -- --host
    ```
    Access via phone on same Wi-Fi using the IP shown.
