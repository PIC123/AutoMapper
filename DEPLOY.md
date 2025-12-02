# AutoMapper - Deployment Guide

Since this application requires a specialized Python environment (PyTorch + SAM) which **Supabase Edge Functions cannot run**, we recommend a split deployment:

1.  **Backend**: Render.com, Railway, or Fly.io (via Docker).
2.  **Frontend**: Vercel, Netlify, or GitHub Pages.

## 1. Backend Deployment (Render.com - Recommended)

We use a Docker container to package the Python backend with the heavy AI models.

1.  Push this repo to GitHub.
2.  Sign up for [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repo.
5.  Select the `backend` directory as the Root Directory (if asked) or ensure settings point to it.
    *   *Actually, for monorepos, it's often easier to tell Render to build the Dockerfile in `backend/`.*
    *   **Runtime**: Docker
    *   **Root Directory**: `backend`
6.  Select **Free** plan (or higher if you need more RAM - SAM is heavy!).
    *   *Warning*: The Free tier has 512MB RAM. ViT-B might struggle. **Starter** plan ($7/mo) is safer.
7.  Deploy.

Render will build the Docker image (which downloads the SAM model) and start the server. Copy your backend URL (e.g., `https://automapper-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

1.  Install Vercel CLI or use the Vercel Dashboard.
2.  Import the repo.
3.  Settings:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   Add `VITE_API_URL` = `https://<YOUR-RENDER-URL>.onrender.com` (no trailing slash, unless your code handles it).
5.  Deploy.

## 3. Why not Supabase?

Supabase is excellent for Database and Auth, but its **Edge Functions** run on Deno (JavaScript/WASM). They cannot run the heavy Python libraries (PyTorch, OpenCV) required for the Segment Anything Model (SAM).

However, you *can* use Supabase for:
*   **Auth**: If you add user login to the app.
*   **Storage**: To save the captured murals and warped configurations.
*   **Database**: To store mapping projects.

You would simply use the Supabase JS Client in the frontend to talk to Supabase for those features, while keeping the "AI Compute" on Render.
