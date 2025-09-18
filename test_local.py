#!/usr/bin/env python3
"""
Test the app locally before deployment
"""

import sys
import os
import requests
import time
import subprocess
import signal

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_python'))

def test_local_app():
    """Test the app locally"""
    print("🧪 Testing app locally...")
    
    # Start the app
    print("🚀 Starting app...")
    try:
        # Import and test the app
        from groq_httpx_ultra import app
        print("✅ App imported successfully")
        
        # Start uvicorn in background
        import uvicorn
        import threading
        
        def run_server():
            uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")
        
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        time.sleep(3)
        
        # Test endpoints
        base_url = "http://127.0.0.1:8000"
        
        # Test root
        print("🔍 Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root: {data.get('message', 'OK')}")
        else:
            print(f"❌ Root failed: {response.status_code}")
            return False
        
        # Test health
        print("🔍 Testing health endpoint...")
        response = requests.get(f"{base_url}/api/papers/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health: {data.get('message', 'OK')}")
        else:
            print(f"❌ Health failed: {response.status_code}")
            return False
        
        # Test paper generation (template mode)
        print("🔍 Testing paper generation...")
        test_data = {
            "title": "Test Paper",
            "sections": ["Abstract", "Introduction"],
            "use_ai": False
        }
        response = requests.post(f"{base_url}/api/papers/generate", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Paper generation: {len(data.get('data', {}).get('sections', {}))} sections")
        else:
            print(f"❌ Paper generation failed: {response.status_code}")
            return False
        
        print("🎉 All local tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Local test error: {e}")
        return False

if __name__ == "__main__":
    success = test_local_app()
    if success:
        print("\n✅ App is ready for deployment!")
        print("🚀 Deploy with: git push origin main")
    else:
        print("\n❌ Fix local issues before deploying")
    
    sys.exit(0 if success else 1)