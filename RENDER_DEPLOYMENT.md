# 🚀 Render Deployment Guide

## Quick Deploy to Render

### Option 1: Automatic Deploy (Recommended)

1. **Connect Repository to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

2. **Set Environment Variables**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Option 2: Manual Configuration

If automatic detection doesn't work:

1. **Create Web Service**
   - Repository: Your GitHub repo
   - Branch: `main`
   - Build Command: `./build_render.sh`
   - Start Command: `python start_render.py`

2. **Environment Variables**
   ```
   PORT=10000
   HOST=0.0.0.0
   ENVIRONMENT=production
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🔧 Files Created for Render

- **`requirements-render.txt`** - Render-optimized dependencies (no Rust)
- **`render.yaml`** - Render service configuration
- **`start_render.py`** - Render startup script
- **`build_render.sh`** - Render build script

## 🐛 Troubleshooting

### Build Failures

1. **Rust/Cargo Errors** (Fixed)
   - Using Pydantic v1.10.12 (no Rust dependencies)
   - Removed `orjson`, `pydantic-settings`, `slowapi`

2. **Memory Issues**
   - Render has memory limits
   - Using minimal dependencies only

3. **Port Issues**
   - Render uses PORT environment variable
   - Configured in `start_render.py`

### Common Solutions

```bash
# If build fails, try minimal requirements
pip install fastapi==0.100.1 uvicorn==0.23.2 httpx==0.24.1 python-dotenv==1.0.0

# Check Python version (Render uses 3.11+)
python --version

# Verify dependencies
pip list
```

## 📊 Render Optimizations

### What We Removed/Changed:
- ❌ `pydantic==2.5.0` → ✅ `pydantic==1.10.12` (no Rust)
- ❌ `orjson==3.9.10` → ✅ `ujson==5.8.0` (pure Python)
- ❌ `pydantic-settings==2.1.0` → ✅ Removed (not essential)
- ❌ `slowapi==0.1.9` → ✅ `limits==3.5.0` (simpler)

### Performance Impact:
- Minimal impact on functionality
- Slightly slower JSON parsing (ujson vs orjson)
- Same API compatibility
- Faster deployment and builds

## 🌐 Expected Render URLs

After deployment:
- **Backend API**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/health`
- **API Docs**: `https://your-app-name.onrender.com/docs`

## 🔄 Deployment Process

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Render Auto-Deploy**
   - Render detects changes
   - Runs build script
   - Starts the service
   - Provides live URL

3. **Update Frontend**
   ```bash
   # Update your frontend environment
   VITE_API_BASE_URL=https://your-render-app.onrender.com/api
   ```

## ✅ Success Checklist

- [ ] Repository connected to Render
- [ ] Environment variables set
- [ ] Build completes without errors
- [ ] Service starts successfully
- [ ] Health check responds
- [ ] API endpoints work
- [ ] Frontend can connect to backend

## 🚨 Important Notes

1. **Free Tier Limitations**
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - Consider paid tier for production

2. **Environment Variables**
   - Set in Render dashboard, not in code
   - Never commit API keys to repository

3. **CORS Configuration**
   - Update CORS origins in backend for your frontend domain
   - Add your Vercel/Netlify URL to allowed origins

## 🎉 Success!

Your PaperFlow backend is now deployed on Render! The optimized configuration ensures:
- ✅ Fast builds (no Rust compilation)
- ✅ Reliable deployments
- ✅ Minimal resource usage
- ✅ Production-ready performance