#!/usr/bin/env python3
"""
Simple entry point for Render deployment
"""

import os
import sys
import uvicorn

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_python'))

# Import the app
from groq_httpx_ultra import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)