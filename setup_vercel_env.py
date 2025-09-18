#!/usr/bin/env python3
"""
Setup environment variables for Vercel deployment
"""

import subprocess
import sys

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {cmd}")
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🔧 Setting up Vercel environment variables...")
    
    # Get backend URL from user
    backend_url = input("Enter your Render backend URL (e.g., https://your-service.onrender.com): ").strip()
    
    if not backend_url:
        print("❌ Backend URL is required")
        return False
    
    # Ensure URL ends with /api
    if not backend_url.endswith('/api'):
        if backend_url.endswith('/'):
            backend_url += 'api'
        else:
            backend_url += '/api'
    
    print(f"Setting API base URL to: {backend_url}")
    
    # Set environment variables
    commands = [
        f'vercel env add VITE_API_BASE_URL production <<< "{backend_url}"',
        f'vercel env add VITE_ENVIRONMENT production <<< "production"'
    ]
    
    for cmd in commands:
        if not run_command(cmd):
            return False
    
    # Redeploy to apply environment variables
    print("🚀 Redeploying to apply environment variables...")
    if not run_command("vercel --prod"):
        return False
    
    print("\n🎉 Environment variables set successfully!")
    print(f"🌐 Your frontend: https://paperflow-frontend-i1atiil2z-ps8760s-projects.vercel.app")
    print(f"🔗 Backend API: {backend_url}")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)