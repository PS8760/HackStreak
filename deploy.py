#!/usr/bin/env python3
"""
PaperFlow Deployment Script
Automated deployment for different platforms
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def check_requirements():
    """Check if required tools are installed"""
    print("🔍 Checking requirements...")
    
    requirements = {
        'docker': 'docker --version',
        'docker-compose': 'docker-compose --version',
        'node': 'node --version',
        'npm': 'npm --version'
    }
    
    missing = []
    for tool, cmd in requirements.items():
        if not run_command(cmd):
            missing.append(tool)
    
    if missing:
        print(f"❌ Missing requirements: {', '.join(missing)}")
        print("Please install the missing tools and try again.")
        return False
    
    print("✅ All requirements satisfied")
    return True

def setup_environment():
    """Setup environment variables"""
    print("🔧 Setting up environment...")
    
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print("📝 Created .env file from template")
            print("⚠️  Please edit .env file with your API keys before continuing")
            
            # Check if API keys are set
            with open(env_file, 'r') as f:
                content = f.read()
                if 'your_groq_api_key_here' in content or 'your_gemini_api_key_here' in content:
                    print("❌ Please update .env file with real API keys")
                    return False
        else:
            print("❌ No .env.example file found")
            return False
    
    print("✅ Environment configured")
    return True

def docker_deploy():
    """Deploy using Docker Compose"""
    print("🐳 Deploying with Docker...")
    
    # Stop existing containers
    print("Stopping existing containers...")
    run_command("docker-compose down")
    
    # Build and start containers
    print("Building and starting containers...")
    if not run_command("docker-compose up -d --build"):
        return False
    
    # Wait for services to start
    print("Waiting for services to start...")
    import time
    time.sleep(10)
    
    # Check health
    if run_command("curl -f http://localhost:8000/health"):
        print("✅ Backend is healthy")
    else:
        print("⚠️  Backend health check failed")
    
    if run_command("curl -f http://localhost:5173"):
        print("✅ Frontend is accessible")
    else:
        print("⚠️  Frontend accessibility check failed")
    
    print("🎉 Docker deployment complete!")
    print("📱 Frontend: http://localhost:5173")
    print("🔧 Backend: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    
    return True

def vercel_deploy():
    """Deploy frontend to Vercel"""
    print("☁️ Deploying to Vercel...")
    
    # Check if vercel CLI is installed
    if not run_command("vercel --version"):
        print("Installing Vercel CLI...")
        if not run_command("npm install -g vercel"):
            return False
    
    # Build the project
    print("Building project...")
    if not run_command("npm run build"):
        return False
    
    # Deploy to Vercel
    print("Deploying to Vercel...")
    if not run_command("vercel --prod"):
        return False
    
    print("✅ Vercel deployment complete!")
    return True

def firebase_deploy():
    """Deploy to Firebase Hosting"""
    print("🔥 Deploying to Firebase Hosting...")
    
    # Check if firebase CLI is installed
    if not run_command("firebase --version"):
        print("Installing Firebase CLI...")
        if not run_command("npm install -g firebase-tools"):
            return False
    
    # Login to Firebase (if not already logged in)
    print("Checking Firebase authentication...")
    if not run_command("firebase projects:list"):
        print("Please login to Firebase...")
        if not run_command("firebase login"):
            return False
    
    # Build the project
    print("Building project...")
    if not run_command("npm run build"):
        return False
    
    # Deploy to Firebase
    print("Deploying to Firebase Hosting...")
    if not run_command("firebase deploy --only hosting"):
        return False
    
    print("✅ Firebase deployment complete!")
    print("🌐 Your app is live at: https://paperflow-d8cd6.web.app")
    return True

def build_production():
    """Build for production"""
    print("🏗️ Building for production...")
    
    # Install dependencies
    print("Installing dependencies...")
    if not run_command("npm install"):
        return False
    
    # Build frontend
    print("Building frontend...")
    if not run_command("npm run build"):
        return False
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    if not run_command("pip install -r backend_python/requirements.txt"):
        return False
    
    print("✅ Production build complete!")
    print("📁 Frontend build: ./dist/")
    print("🐍 Backend ready: ./backend_python/")
    
    return True

def main():
    """Main deployment function"""
    print("🚀 PaperFlow Deployment Script")
    print("=" * 40)
    
    if len(sys.argv) < 2:
        print("Usage: python deploy.py [option]")
        print("\nOptions:")
        print("  docker     - Deploy with Docker Compose (recommended)")
        print("  vercel     - Deploy frontend to Vercel")
        print("  firebase   - Deploy to Firebase Hosting")
        print("  build      - Build for production")
        print("  check      - Check requirements only")
        return
    
    option = sys.argv[1].lower()
    
    # Check requirements for all options except 'check'
    if option != 'check' and not check_requirements():
        return
    
    # Setup environment for deployment options
    if option in ['docker', 'vercel', 'build'] and not setup_environment():
        return
    
    if option == 'check':
        check_requirements()
    elif option == 'docker':
        docker_deploy()
    elif option == 'vercel':
        vercel_deploy()
    elif option == 'firebase':
        firebase_deploy()
    elif option == 'build':
        build_production()
    else:
        print(f"❌ Unknown option: {option}")
        print("Available options: docker, vercel, firebase, build, check")

if __name__ == "__main__":
    main()