#!/usr/bin/env python3
"""
Ultra-Fast PaperFlow Launcher
Optimized for maximum speed and efficiency
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path
import threading
import signal

class UltraFastLauncher:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def instant_cleanup(self):
        """Ultra-fast cleanup of existing processes"""
        print("⚡ Lightning cleanup...")
        
        # Kill processes in parallel
        cleanup_commands = [
            ["pkill", "-f", "uvicorn"],
            ["pkill", "-f", "vite"],
            ["pkill", "-f", "fast_main"],
            ["pkill", "-f", "minimal_main"]
        ]
        
        processes = []
        for cmd in cleanup_commands:
            p = subprocess.Popen(cmd, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
            processes.append(p)
        
        # Wait for all cleanup processes
        for p in processes:
            try:
                p.wait(timeout=1)
            except subprocess.TimeoutExpired:
                p.kill()
        
        # Kill by ports in parallel
        port_commands = [
            f"lsof -ti :8000 | xargs kill -9 2>/dev/null || true",
            f"lsof -ti :5173 | xargs kill -9 2>/dev/null || true"
        ]
        
        for cmd in port_commands:
            subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        
        time.sleep(0.5)  # Minimal wait
        print("✅ Cleanup complete")
    
    def instant_env_setup(self):
        """Ultra-fast environment setup"""
        print("⚡ Lightning environment setup...")
        
        # Create both env files in parallel
        def create_backend_env():
            backend_env = Path("backend_python/.env")
            if not backend_env.exists():
                backend_env.write_text("""PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=ERROR
""")
        
        def create_frontend_env():
            frontend_env = Path(".env")
            if not frontend_env.exists():
                frontend_env.write_text("""VITE_API_BASE_URL=http://localhost:8000/api
""")
        
        # Run in parallel
        backend_thread = threading.Thread(target=create_backend_env)
        frontend_thread = threading.Thread(target=create_frontend_env)
        
        backend_thread.start()
        frontend_thread.start()
        
        backend_thread.join()
        frontend_thread.join()
        
        print("✅ Environment ready")
    
    def start_ultra_fast_backend(self):
        """Start the ultra-fast backend"""
        print("⚡ Starting ultra-fast backend...")
        
        try:
            # Start the fast backend with minimal logging
            self.backend_process = subprocess.Popen([
                sys.executable, "fast_main.py"
            ], 
            cwd="backend_python",
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
            )
            
            # Minimal wait - fast backend starts almost instantly
            time.sleep(1.5)
            
            # Quick test
            import requests
            try:
                response = requests.get("http://localhost:8000/", timeout=2)
                if response.status_code == 200:
                    print("✅ Ultra-fast backend ready")
                    return True
            except:
                pass
            
            # If first test fails, wait a bit more
            time.sleep(1)
            try:
                response = requests.get("http://localhost:8000/", timeout=2)
                if response.status_code == 200:
                    print("✅ Ultra-fast backend ready")
                    return True
            except:
                pass
            
            print("❌ Backend failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Backend error: {e}")
            return False
    
    def start_fast_frontend(self):
        """Start frontend with optimizations"""
        print("⚡ Starting optimized frontend...")
        
        try:
            # Check if node_modules exists, install if needed (in background)
            if not Path("node_modules").exists():
                print("📦 Installing dependencies...")
                subprocess.run(["npm", "install", "--silent"], 
                             stdout=subprocess.DEVNULL, 
                             stderr=subprocess.DEVNULL)
            
            # Start frontend with optimizations
            env = os.environ.copy()
            env.update({
                'NODE_ENV': 'development',
                'VITE_DISABLE_HMRPORT': 'true'  # Disable HMR port for faster startup
            })
            
            self.frontend_process = subprocess.Popen([
                "npm", "run", "dev", "--", "--host", "0.0.0.0"
            ], 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL,
            env=env
            )
            
            # Minimal wait for frontend
            time.sleep(2)
            
            if self.frontend_process.poll() is None:
                print("✅ Optimized frontend ready")
                return True
            else:
                print("❌ Frontend failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Frontend error: {e}")
            return False
    
    def open_browser_fast(self):
        """Open browser without blocking"""
        def open_browser():
            time.sleep(1)  # Small delay to ensure services are ready
            try:
                webbrowser.open("http://localhost:5173")
            except:
                pass
        
        threading.Thread(target=open_browser, daemon=True).start()
    
    def monitor_lightweight(self):
        """Lightweight monitoring"""
        print("\n🚀 PaperFlow Ultra-Fast is ready!")
        print("=" * 40)
        print("⚡ Frontend: http://localhost:5173")
        print("⚡ Backend: http://localhost:8000")
        print("⚡ Performance: MAXIMUM SPEED")
        print("=" * 40)
        print("Press Ctrl+C to stop")
        
        try:
            while self.running:
                time.sleep(5)  # Check less frequently for better performance
                
                # Quick health checks
                if self.backend_process and self.backend_process.poll() is not None:
                    print("❌ Backend died")
                    break
                
                if self.frontend_process and self.frontend_process.poll() is not None:
                    print("❌ Frontend died")
                    break
                    
        except KeyboardInterrupt:
            print("\n⚡ Fast shutdown...")
            self.running = False
    
    def fast_shutdown(self):
        """Ultra-fast shutdown"""
        print("⚡ Lightning shutdown...")
        
        # Terminate processes quickly
        if self.backend_process:
            self.backend_process.terminate()
        if self.frontend_process:
            self.frontend_process.terminate()
        
        # Don't wait long for graceful shutdown
        time.sleep(0.5)
        
        # Force kill if needed
        if self.backend_process and self.backend_process.poll() is None:
            self.backend_process.kill()
        if self.frontend_process and self.frontend_process.poll() is None:
            self.frontend_process.kill()
        
        self.instant_cleanup()
        print("✅ Fast shutdown complete")
    
    def run(self):
        """Ultra-fast startup sequence"""
        start_time = time.time()
        
        print("🚀 PaperFlow Ultra-Fast Launcher")
        print("=" * 40)
        
        try:
            # Step 1: Lightning cleanup (0.5s)
            self.instant_cleanup()
            
            # Step 2: Lightning environment setup (0.1s)
            self.instant_env_setup()
            
            # Step 3: Start ultra-fast backend (1.5s)
            if not self.start_ultra_fast_backend():
                print("❌ Backend startup failed")
                return False
            
            # Step 4: Start optimized frontend (2s)
            if not self.start_fast_frontend():
                print("❌ Frontend startup failed")
                return False
            
            # Step 5: Open browser (non-blocking)
            self.open_browser_fast()
            
            startup_time = time.time() - start_time
            print(f"⚡ Total startup time: {startup_time:.1f}s")
            
            # Step 6: Lightweight monitoring
            self.monitor_lightweight()
            
            return True
            
        except Exception as e:
            print(f"❌ Startup failed: {e}")
            return False
        
        finally:
            self.fast_shutdown()

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully"""
    print("\n⚡ Received shutdown signal...")
    sys.exit(0)

def main():
    # Set up signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    launcher = UltraFastLauncher()
    success = launcher.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()