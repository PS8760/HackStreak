# 🚀 PaperFlow - How to Run the Project

## 📋 Prerequisites

Before running PaperFlow, make sure you have the following installed:

### Required Software
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)

### Check Your Installation
```bash
python --version    # Should be 3.8+
node --version      # Should be 18+
npm --version       # Should be 8+
```

## 🎯 Quick Start (Recommended)

### Option 1: Automatic Full-Stack Startup

The easiest way to run the entire project:

```bash
# Navigate to project directory
cd ResearchPaper

# Run the full-stack startup script
python start_fullstack.py
```

This script will:
- ✅ Check all requirements
- 📦 Install Python and Node.js dependencies
- 🔧 Create environment files
- 🚀 Start both backend and frontend
- 🌐 Open the application in your browser

**Access the application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Option 2: Manual Setup

If you prefer to run services separately:

#### Step 1: Setup Backend (Python FastAPI)
```bash
# Navigate to backend directory
cd ResearchPaper/backend_python

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 2: Setup Frontend (React + Vite)
```bash
# Navigate to project root (open new terminal)
cd ResearchPaper

# Install Node.js dependencies
npm install

# Start the frontend development server
npm run dev
```

## 🧪 Testing the Installation

After starting the services, run the integration tests:

```bash
# Run integration tests
python test_integration.py

# Or with custom settings
python test_integration.py --url http://localhost:8000 --wait 10
```

## 📁 Project Structure

```
ResearchPaper/
├── backend_python/          # Python FastAPI backend
│   ├── main.py             # Main FastAPI application
│   ├── services/           # Business logic services
│   ├── models/             # Data models and schemas
│   ├── middleware/         # Custom middleware
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API integration
│   └── contexts/          # React contexts
├── start_fullstack.py     # Full-stack startup script
├── test_integration.py    # Integration tests
└── package.json           # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables

The startup script automatically creates these files, but you can customize them:

**Backend (.env in backend_python/)**
```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_api_key_here
```

**Frontend (.env in project root)**
```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_API_BASE_URL=http://localhost:8000/api
```

### API Key Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Replace `your_api_key_here` in both .env files
3. Restart the services

## 🎮 Using the Application

### 1. Generate Fake Research Papers
- Navigate to the main page
- Enter a research paper title
- Select sections to generate
- Add custom sections if needed
- Click "Generate Fake Scientific Paper"
- Download as PDF when ready

### 2. Verify Paper Authenticity
- Go to the "Verify" page
- Either paste text or upload a PDF
- Click "Detect Fake Content"
- Review the analysis results

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on ports 8000 or 5173
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Python Dependencies Issues**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend_python/requirements.txt
```

**Node.js Dependencies Issues**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**CORS Issues**
- Make sure both services are running on correct ports
- Check that FRONTEND_URL in backend .env matches frontend URL

**API Key Issues**
- Verify your Gemini API key is valid
- Check that the key is properly set in both .env files
- Restart services after changing API keys

### Getting Help

**Check Service Status:**
```bash
# Test backend health
curl http://localhost:8000/api/papers/health

# Check if frontend is running
curl http://localhost:5173
```

**View Logs:**
- Backend logs appear in the terminal where you started the Python server
- Frontend logs appear in the browser console (F12)

**Run Diagnostics:**
```bash
# Run integration tests for detailed diagnostics
python test_integration.py
```

## 🔄 Development Workflow

### Making Changes

**Backend Changes:**
- Edit files in `backend_python/`
- FastAPI auto-reloads on file changes
- Check logs in terminal

**Frontend Changes:**
- Edit files in `src/`
- Vite auto-reloads on file changes
- Check browser console for errors

### Adding New Features

1. **Backend**: Add new endpoints in `backend_python/main.py`
2. **Frontend**: Update `src/services/apiService.js` to call new endpoints
3. **Test**: Add tests to `test_integration.py`

## 📚 API Documentation

When the backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🎯 Production Deployment

For production deployment:

1. **Backend**: Use a production WSGI server like Gunicorn
2. **Frontend**: Build with `npm run build` and serve static files
3. **Environment**: Set `ENVIRONMENT=production` in backend .env
4. **Security**: Use proper API keys and CORS settings

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Run the integration tests
3. Check the logs for error messages
4. Ensure all prerequisites are installed correctly

---

**Happy coding! 🎉**