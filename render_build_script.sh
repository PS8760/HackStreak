#!/bin/bash
# Render build script with forced Python 3.11 compatibility

echo "🔧 Starting Render build with Python compatibility fixes..."

# Check Python version
python --version

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install packages one by one with specific versions
echo "📦 Installing FastAPI ecosystem..."
pip install --no-cache-dir fastapi==0.88.0
pip install --no-cache-dir uvicorn==0.20.0
pip install --no-cache-dir httpx==0.23.3
pip install --no-cache-dir python-dotenv==1.0.0
pip install --no-cache-dir pydantic==1.10.2
pip install --no-cache-dir typing-extensions==4.4.0

echo "📦 Installing PDF and file handling..."
pip install --no-cache-dir reportlab==3.6.13
pip install --no-cache-dir PyPDF2==3.0.1
pip install --no-cache-dir python-multipart==0.0.6

# Verify installation
echo "🧪 Verifying installation..."
python -c "import fastapi; print(f'FastAPI: {fastapi.__version__}')"
python -c "import uvicorn; print(f'Uvicorn: {uvicorn.__version__}')"
python -c "import pydantic; print(f'Pydantic: {pydantic.VERSION}')"
python -c "import reportlab; print('ReportLab: OK')"
python -c "import PyPDF2; print('PyPDF2: OK')"

# Run verification script
echo "✅ Running verification..."
python verify_minimal_build.py

echo "🎉 Build completed successfully!"