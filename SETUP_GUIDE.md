# 🚀 PaperFlow Setup Guide for New Users

## 📋 What You Need

- **Python 3.8+** - [Download here](https://python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **API Keys** (free):
  - [Groq API Key](https://console.groq.com/) - For ultra-fast AI
  - [Gemini API Key](https://makersuite.google.com/app/apikey) - For verification

## ⚡ Quick Setup (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ResearchPaper

# 2. Run the installer
python install.py

# 3. Add your API keys to .env file
nano .env

# 4. Start the application
python start.py
```

**That's it!** Your app will be running at http://localhost:5173

## 🔧 Manual Setup (Alternative)

If you prefer manual control:

### 1. Install Python Dependencies
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

### 4. Start the Application
```bash
python start.py
```

## 📦 What's in requirements.txt

Our unified `requirements.txt` includes everything you need:

```txt
# Core FastAPI framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# HTTP clients for AI APIs
httpx==0.25.2
requests==2.31.0

# PDF processing
PyPDF2==3.0.1
reportlab==4.0.7

# Data validation
pydantic==2.5.0

# File handling
python-multipart==0.0.6
aiofiles==23.2.1

# Environment management
python-dotenv==1.0.0

# Security (optional)
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Development tools
pytest==7.4.3
rich==13.7.0
```

## 🔑 API Keys Setup

### Groq API Key (Required)
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up/Login
3. Go to API Keys
4. Create new key
5. Copy to `.env` file as `GROQ_API_KEY=your_key_here`

### Gemini API Key (Required)
1. Visit [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Create API key
4. Copy to `.env` file as `GEMINI_API_KEY=your_key_here`

### Firebase (Pre-configured)
Firebase is already configured for authentication and database. No additional setup needed!

## 🚀 Deployment Options

Once your app is working locally:

```bash
# Docker deployment (recommended)
python deploy.py docker

# Firebase hosting
python deploy.py firebase

# Vercel deployment
python deploy.py vercel

# Manual build
python deploy.py build
```

## 🔍 Troubleshooting

### Common Issues

1. **Python version error**
   ```bash
   python --version  # Should be 3.8+
   ```

2. **Node.js not found**
   ```bash
   node --version    # Should be 16+
   npm --version     # Should be 8+
   ```

3. **Permission errors**
   ```bash
   # On macOS/Linux, try:
   sudo python install.py
   ```

4. **Virtual environment issues**
   ```bash
   # Delete and recreate
   rm -rf venv
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

5. **Port conflicts**
   ```bash
   # Kill processes on ports 5173 and 8000
   lsof -ti:5173 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

### Getting Help

1. **Check logs**: Look for error messages in terminal
2. **Verify API keys**: Make sure they're correctly set in `.env`
3. **Test individually**: 
   - Backend: `cd backend_python && python groq_httpx_ultra.py`
   - Frontend: `npm run dev`

## ✅ Success Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can generate a research paper
- [ ] Paper verification works
- [ ] User authentication works (if enabled)
- [ ] No console errors

## 🎉 You're Ready!

Your PaperFlow application is now set up and ready to generate professional research papers in under 1 second!

**Next Steps:**
- Generate your first paper
- Try the verification system
- Deploy to production when ready
- Customize sections and templates

**Support:**
- Check the logs for any errors
- Ensure all API keys are valid
- Verify Python and Node.js versions