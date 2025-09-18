#!/usr/bin/env python3
"""
Vercel deployment script for PaperFlow frontend
"""

import subprocess
import sys
import os

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True, cwd=cwd)
        print(f"✅ {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        print(f"Error: {e.stderr}")
        return False

def check_vercel_cli():
    """Check if Vercel CLI is installed"""
    try:
        result = subprocess.run("vercel --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Vercel CLI found: {result.stdout.strip()}")
            return True
        else:
            return False
    except:
        return False

def install_vercel_cli():
    """Install Vercel CLI"""
    print("📦 Installing Vercel CLI...")
    return run_command("npm install -g vercel")

def main():
    print("🚀 Deploying PaperFlow Frontend to Vercel...")
    
    # Check if we're in the right directory
    if not os.path.exists("package.json"):
        print("❌ package.json not found. Please run this script from the project root.")
        return False
    
    # Check Vercel CLI
    if not check_vercel_cli():
        print("⚠️  Vercel CLI not found. Installing...")
        if not install_vercel_cli():
            print("❌ Failed to install Vercel CLI")
            return False
    
    # Install dependencies
    print("📦 Installing dependencies...")
    if not run_command("npm install"):
        return False
    
    # Build the project
    print("🔨 Building project...")
    if not run_command("npm run build"):
        return False
    
    # Deploy to Vercel
    print("🚀 Deploying to Vercel...")
    if not run_command("vercel --prod"):
        print("⚠️  Production deployment failed. Trying regular deployment...")
        if not run_command("vercel"):
            return False
    
    print("\n🎉 Frontend deployed successfully!")
    print("\n📋 Next steps:")
    print("1. Update your backend URL in Vercel environment variables")
    print("2. Set VITE_API_BASE_URL to your Render backend URL")
    print("3. Test the deployed frontend")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)