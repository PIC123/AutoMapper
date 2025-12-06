# AutoMapper - Local Run Guide

Since we are running the backend locally to utilize your full hardware (GPU/RAM), follow these steps:

## 1. Backend Setup

1.  **Install Python Dependencies**:
    ```bash
    cd backend
    # Recommended: Create virtual env
    # python -m venv .venv
    # source .venv/bin/activate
    pip install -r requirements.txt
    ```

2.  **Download SAM Weights**:
    Download the "ViT-H" (Huge) model for best results:
    [https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth)
    
    Save it as `sam_vit_h_4b8939.pth` inside the `backend/` folder.

3.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

## 2. Expose to Internet (for Mobile)

Since your phone needs to reach your computer, use **ngrok** or **localtunnel**.

1.  **Install ngrok** (if not installed): https://ngrok.com/download
2.  **Start Tunnel**:
    ```bash
    ngrok http 8000
    ```
    Copy the HTTPS URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).

## 3. Frontend Setup

1.  **Configure API URL**:
    *   Open `frontend/.env` (create if missing).
    *   Add: `VITE_API_URL=https://<YOUR_NGROK_URL>`
    *   *Or just hardcode it in `frontend/src/utils/api.ts` if easier for testing.*

2.  **Run Frontend**:
    ```bash
    cd frontend
    npm run dev -- --host
    ```
    Access the frontend on your phone via the IP address shown (e.g., `http://192.168.1.50:5173`).

## Summary
*   **Backend**: Running on your PC (port 8000) -> Tunnel -> Internet.
*   **Frontend**: Running on your PC (port 5173) -> Accessed by Phone via Wi-Fi.
*   **Phone**: Sends images to Ngrok URL -> Your PC processes them with GPU -> Returns masks.

