#!/usr/bin/env python3
"""
PaperFlow - Clean Launcher
Starts the ultra-fast Groq-powered backend and frontend
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

def cleanup_ports():
    """Clean up ports 8000 and 5173"""
    print("🧹 Cleaning up ports...")
    subprocess.run(["pkill", "-f", "uvicorn"], stderr=subprocess.DEVNULL)
    subprocess.run(["pkill", "-f", "vite"], stderr=subprocess.DEVNULL)
    subprocess.run("lsof -ti :8000 | xargs kill -9 2>/dev/null || true", shell=True)
    subprocess.run("lsof -ti :5173 | xargs kill -9 2>/dev/null || true", shell=True)
    time.sleep(1)
    print("✅ Ports cleaned")

def setup_env():
    """Setup environment files"""
    print("⚡ Setting up environment...")
    
    # Backend .env
    backend_env = Path("backend_python/.env")
    if not backend_env.exists():
        backend_env.write_text("""PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=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
""")
    
    # Frontend .env
    frontend_env = Path(".env")
    if not frontend_env.exists():
        frontend_env.write_text("""VITE_API_BASE_URL=http://localhost:8000/api
""")
    
    print("✅ Environment ready")

def start_backend():
    """Start the ultra-fast Groq backend"""
    print("🚀 Starting ultra-fast AI backend...")
    
    try:
        process = subprocess.Popen([
            sys.executable, "groq_httpx_ultra.py"
        ], cwd="backend_python")
        
        # Wait for startup
        time.sleep(3)
        
        # Test if it's working
        import requests
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend ready: {data['message']}")
            print(f"🤖 AI Model: {data['ai_model']}")
            return process
        else:
            print("❌ Backend failed to start")
            return None
            
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return None

def start_frontend():
    """Start the frontend"""
    print("⚛️ Starting frontend...")
    
    try:
        # Install dependencies if needed
        if not Path("node_modules").exists():
            print("📦 Installing dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        process = subprocess.Popen(["npm", "run", "dev"])
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Frontend ready")
            return process
        else:
            print("❌ Frontend failed to start")
            return None
            
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return None

def main():
    print("🚀 PaperFlow - Ultra-Fast AI Paper Generator")
    print("=" * 50)
    
    backend_process = None
    frontend_process = None
    
    try:
        # Setup
        cleanup_ports()
        setup_env()
        
        # Start services
        backend_process = start_backend()
        if not backend_process:
            print("❌ Failed to start backend")
            return False
        
        frontend_process = start_frontend()
        if not frontend_process:
            print("❌ Failed to start frontend")
            return False
        
        # Success
        print("\n🎉 PaperFlow is ready!")
        print("=" * 50)
        print("🌐 Frontend: http://localhost:5173")
        print("🤖 Backend: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
        print("⚡ Performance: ULTRA-FAST AI")
        print("=" * 50)
        
        # Open browser
        try:
            webbrowser.open("http://localhost:5173")
            print("🌐 Opening in browser...")
        except:
            pass
        
        print("Press Ctrl+C to stop")
        
        # Keep running
        while True:
            time.sleep(2)
            if backend_process and backend_process.poll() is not None:
                print("❌ Backend died")
                break
            if frontend_process and frontend_process.poll() is not None:
                print("❌ Frontend died")
                break
                
    except KeyboardInterrupt:
        print("\n⚡ Shutting down...")
        
    finally:
        # Cleanup
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        cleanup_ports()
        print("✅ Shutdown complete")

if __name__ == "__main__":
    main()