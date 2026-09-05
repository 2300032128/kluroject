# 🌐 Deployment Guide for EduAgent AI

This guide walks through deploying **EduAgent AI** to production with live, public URLs for both the Frontend (Next.js) and Backend (FastAPI).

---

## ⚡ Quick 1-Click Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) — *Recommended (Free & Fast)*

#### Step 1: Deploy Backend on Render (2 minutes)
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `https://github.com/2300032128/kluroject`.
3. Configure the service:
   - **Name**: `eduagent-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PORT`: `8000`
   - `DEMO_MODE`: `true`
   - `DATABASE_URL`: `sqlite:///./eduagent.db`
5. Click **Create Web Service**.
6. Copy your public backend URL (e.g. `https://eduagent-backend.onrender.com`).

---

#### Step 2: Deploy Frontend on Vercel (1 minute)
1. Go to [vercel.com/new](https://vercel.com/new) and log in with GitHub.
2. Select your repository: `2300032128/kluroject`.
3. Configure the project:
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Framework Preset**: Next.js (automatically detected).
4. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://eduagent-backend.onrender.com`).
5. Click **Deploy**.
6. Your app will be live at `https://kluroject.vercel.app`! 🎉

---

### Option 2: Full-Stack Deploy on Railway

1. Go to [railway.app](https://railway.app) $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select `2300032128/kluroject`.
3. Railway automatically detects `docker-compose.yml` or the Dockerfiles and spins up both services with persistent storage.

---

### Option 3: Local / Self-Hosted Docker Deployment

Run both frontend and backend anywhere using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/2300032128/kluroject.git
cd kluroject

# Build and launch all containers
docker compose up --build -d
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
