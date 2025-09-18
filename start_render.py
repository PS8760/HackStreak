#!/usr/bin/env python3
"""
Render deployment startup script for PaperFlow backend
"""

import os
import sys
import uvicorn

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_python'))

# Import the FastAPI app
from groq_httpx_ultra import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PaperFlow backend on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )