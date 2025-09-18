# 🚀 PaperFlow Deployment Guide

## Deployment Options

Choose the deployment method that best fits your needs:

1. **[Docker Deployment](#docker-deployment)** - Recommended for production
2. **[Vercel + Railway](#vercel--railway)** - Easiest cloud deployment
3. **[Firebase Hosting](#firebase-hosting)** - Google Cloud integration
4. **[Manual VPS Deployment](#manual-vps-deployment)** - Full control

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)

### Quick Deploy
```bash
# Clone and navigate to project
git clone <your-repo-url>
cd ResearchPaper

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Deploy with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

### Production Docker Setup
```bash
# Create production docker-compose
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - HOST=0.0.0.0
      - ENVIRONMENT=production
      - FRONTEND_URL=https://your-domain.com
      - GROQ_API_KEY=\${GROQ_API_KEY}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:5173"
    environment:
      - VITE_API_BASE_URL=https://your-domain.com/api
      - VITE_GROQ_API_KEY=\${GROQ_API_KEY}
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
EOF

# Deploy production
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ Vercel + Railway (Easiest)

### Frontend on Vercel

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables in Vercel Dashboard**
   - `VITE_API_BASE_URL`: Your Railway backend URL
   - `VITE_GROQ_API_KEY`: Your Groq API key
   - `VITE_GEMINI_API_KEY`: Your Gemini API key

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Backend on Render (Recommended)

1. **Deploy to Render**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   
   # Go to render.com and connect repository
   # Render will auto-detect render.yaml configuration
   ```

2. **Set Environment Variables in Render Dashboard**
   ```
   GROQ_API_KEY=your_groq_key
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

3. **Render Configuration (Automatic)**
   - Uses `requirements-render.txt` (no Rust dependencies)
   - Optimized for Render's build environment
   - Automatic HTTPS and custom domains

### Backend on Railway (Alternative)

1. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Configure Environment Variables**
   ```bash
   railway variables set GROQ_API_KEY=your_groq_key
   railway variables set GEMINI_API_KEY=your_gemini_key
   railway variables set FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

---

## 🔥 Firebase Hosting

### Setup Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   # Select your Firebase project
   # Set public directory to: dist
   # Configure as SPA: Yes
   # Set up automatic builds: No
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Backend Deployment
Deploy backend separately on Railway, Render, or your VPS, then update:
```bash
# Update environment variables
echo "VITE_API_BASE_URL=https://your-backend-url.com/api" > .env
npm run build
firebase deploy
```

---

## 🖥️ Manual VPS Deployment

### Server Setup (Ubuntu/Debian)

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Python
   sudo apt install python3 python3-pip python3-venv -y

   # Install Nginx
   sudo apt install nginx -y

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Backend**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd ResearchPaper/backend_python

   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # Create environment file
   cat > .env << EOF
   GROQ_API_KEY=your_groq_key
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://your-domain.com
   PORT=8000
   HOST=0.0.0.0
   ENVIRONMENT=production
   EOF

   # Start with PM2
   pm2 start "python -m uvicorn groq_httpx_ultra:app --host 0.0.0.0 --port 8000" --name paperflow-backend
   ```

3. **Deploy Frontend**
   ```bash
   cd ../
   
   # Install dependencies
   npm install

   # Create production environment
   cat > .env << EOF
   VITE_API_BASE_URL=https://your-domain.com/api
   VITE_GROQ_API_KEY=your_groq_key
   EOF

   # Build for production
   npm run build

   # Serve with PM2
   pm2 serve dist 5173 --name paperflow-frontend
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/paperflow
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/paperflow /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

   # Save PM2 processes
   pm2 save
   pm2 startup
   ```

---

## 🔐 Environment Variables

### Required Variables

**Backend (.env)**
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://your-frontend-domain.com
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

1. **Groq API Key**
   - Visit [Groq Console](https://console.groq.com/)
   - Sign up/Login
   - Go to API Keys section
   - Create new API key

2. **Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Create API key

---

## 🔍 Health Checks & Monitoring

### Health Check Endpoints
- Backend: `https://your-domain.com/api/health`
- Frontend: `https://your-domain.com/`

### Monitoring Setup
```bash
# Add to crontab for health monitoring
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * curl -f https://your-domain.com/api/health || echo "Backend down" | mail -s "PaperFlow Alert" your-email@domain.com
```

---

## 🚀 Quick Deploy Commands

### Docker (Fastest)
```bash
git clone <repo-url> && cd ResearchPaper
cp .env.example .env  # Edit with your keys
docker-compose up -d
```

### Vercel + Railway
```bash
# Frontend
vercel --prod

# Backend
railway up
```

### Firebase
```bash
npm run build
firebase deploy
```

---

## 📊 Performance Optimization

### Production Optimizations Applied
- ✅ Groq ultra-fast AI (0.8s generation)
- ✅ Parallel processing
- ✅ Template fallbacks
- ✅ Optimized Docker images
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Health checks
- ✅ Auto-restart on failure

### Expected Performance
- **Paper Generation**: < 1 second
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Uptime**: 99.9%

---

## 🎯 Post-Deployment Checklist

- [ ] Backend health check responds
- [ ] Frontend loads correctly
- [ ] Paper generation works
- [ ] Verification system works
- [ ] User authentication works (if enabled)
- [ ] All API endpoints respond
- [ ] SSL certificate installed (production)
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update `FRONTEND_URL` in backend environment
   - Check API base URL in frontend

2. **API Key Issues**
   - Verify Groq API key is valid
   - Check Gemini API key permissions

3. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **Docker Issues**
   - Rebuild images: `docker-compose build --no-cache`
   - Check logs: `docker-compose logs -f`

### Support
- Check logs: `docker-compose logs -f`
- Health check: `curl https://your-domain.com/api/health`
- PM2 status: `pm2 status`

---

## 🎉 Success!

Your PaperFlow application is now deployed and ready to generate research papers at lightning speed!

**Access your deployed app:**
- Frontend: `https://your-domain.com`
- Backend API: `https://your-domain.com/api`
- API Documentation: `https://your-domain.com/docs`