# 🚀 Quick Deploy Guide

## 1. Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required API Keys:**
- **Groq API**: Get from [console.groq.com](https://console.groq.com/)
- **Gemini API**: Get from [makersuite.google.com](https://makersuite.google.com/app/apikey)

## 2. Choose Deployment Method

### 🐳 Docker (Recommended)
```bash
python deploy.py docker
```
**Result**: App running at http://localhost:5173

### ☁️ Vercel (Cloud)
```bash
python deploy.py vercel
```
**Result**: App deployed to Vercel URL

### 🏗️ Manual Build
```bash
python deploy.py build
```
**Result**: Production files ready for any hosting

## 3. Access Your App

- **Frontend**: http://localhost:5173 (or your deployed URL)
- **Backend API**: http://localhost:8000/api
- **API Docs**: http://localhost:8000/docs

## 🔧 Troubleshooting

### Common Issues
1. **Missing API Keys**: Update `.env` file
2. **Port Conflicts**: Stop other services on ports 5173/8000
3. **Docker Issues**: Run `docker-compose down` then retry

### Health Checks
```bash
# Backend
curl http://localhost:8000/health

# Frontend  
curl http://localhost:5173
```

## 🎯 Production Checklist

- [ ] API keys configured
- [ ] Domain name setup (if applicable)
- [ ] SSL certificate installed
- [ ] Health monitoring enabled
- [ ] Backup strategy implemented

## 📞 Support

Check logs:
```bash
# Docker logs
docker-compose logs -f

# Deployment script help
python deploy.py
```

That's it! Your PaperFlow app is ready to generate research papers at lightning speed! ⚡