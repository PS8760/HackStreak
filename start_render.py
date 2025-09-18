#!/usr/bin/env python3
"""
Render deployment startup script for PaperFlow backend
"""

import os
import sys
import uvicorn

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend_python')
sys.path.insert(0, backend_path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PaperFlow backend on {host}:{port}")
    print(f"📁 Backend path: {backend_path}")
    print(f"🐍 Python path: {sys.path[:3]}")
    
    # Import and run the FastAPI app
    try:
        from groq_httpx_ultra import app
        print("✅ Successfully imported FastAPI app")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("📂 Available files in backend_python:")
        try:
            import os
            files = os.listdir(backend_path)
            for f in files:
                print(f"  - {f}")
        except:
            pass
        sys.exit(1)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)