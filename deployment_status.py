#!/usr/bin/env python3
"""
Check if you have actually deployed to Render and guide you through the process
"""

import os
import subprocess
import sys

def check_git_status():
    """Check if code is committed and pushed"""
    print("🔍 Checking Git status...")
    
    try:
        # Check if we're in a git repo
        result = subprocess.run(['git', 'status'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Not in a Git repository")
            return False
        
        # Check for uncommitted changes
        if "nothing to commit" not in result.stdout:
            print("⚠️  You have uncommitted changes")
            print("📝 Commit your changes:")
            print("   git add .")
            print("   git commit -m 'Ready for deployment'")
            return False
        
        # Check if we have a remote
        result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True)
        if not result.stdout.strip():
            print("❌ No Git remote configured")
            print("📝 Add a GitHub remote:")
            print("   git remote add origin https://github.com/yourusername/your-repo.git")
            return False
        
        print("✅ Git repository is ready")
        return True
        
    except FileNotFoundError:
        print("❌ Git not found. Please install Git first.")
        return False

def check_render_files():
    """Check if Render deployment files exist"""
    print("\n🔍 Checking Render deployment files...")
    
    required_files = [
        'render.yaml',
        'requirements-minimal.txt',
        'app.py',
        'backend_python/groq_httpx_ultra.py'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    
    print("✅ All Render deployment files present")
    return True

def check_environment_vars():
    """Check if environment variables are set"""
    print("\n🔍 Checking environment variables...")
    
    # Check .env file
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            content = f.read()
            
        if 'GROQ_API_KEY=' in content and 'your_groq_api_key_here' not in content:
            print("✅ GROQ_API_KEY appears to be set in .env")
        else:
            print("❌ GROQ_API_KEY not properly set in .env")
            return False
            
        if 'GEMINI_API_KEY=' in content and 'your_gemini_api_key_here' not in content:
            print("✅ GEMINI_API_KEY appears to be set in .env")
        else:
            print("❌ GEMINI_API_KEY not properly set in .env")
            return False
    else:
        print("❌ No .env file found")
        print("📝 Create .env file:")
        print("   cp .env.example .env")
        print("   # Edit .env with your API keys")
        return False
    
    return True

def provide_deployment_guide():
    """Provide step-by-step deployment guide"""
    print("\n" + "="*60)
    print("🚀 RENDER DEPLOYMENT GUIDE")
    print("="*60)
    
    print("\n1️⃣ PREPARE YOUR CODE:")
    print("   ✅ Commit all changes:")
    print("      git add .")
    print("      git commit -m 'Ready for Render deployment'")
    print("   ✅ Push to GitHub:")
    print("      git push origin main")
    
    print("\n2️⃣ DEPLOY ON RENDER:")
    print("   ✅ Go to https://render.com")
    print("   ✅ Sign up/Login (can use GitHub)")
    print("   ✅ Click 'New +' → 'Web Service'")
    print("   ✅ Connect your GitHub repository")
    print("   ✅ Render should auto-detect render.yaml")
    
    print("\n3️⃣ SET ENVIRONMENT VARIABLES:")
    print("   ✅ In Render dashboard, add:")
    print("      GROQ_API_KEY = your_actual_groq_key")
    print("      GEMINI_API_KEY = your_actual_gemini_key")
    
    print("\n4️⃣ DEPLOY:")
    print("   ✅ Click 'Create Web Service'")
    print("   ✅ Wait for build to complete (~3-5 minutes)")
    print("   ✅ Copy your app URL (e.g., https://paperflow-backend-abc123.onrender.com)")
    
    print("\n5️⃣ TEST DEPLOYMENT:")
    print("   ✅ Use your ACTUAL URL:")
    print("      python check_deployment.py https://your-actual-url.onrender.com")
    
    print("\n📋 GET API KEYS:")
    print("   🔑 Groq API Key: https://console.groq.com/")
    print("   🔑 Gemini API Key: https://makersuite.google.com/app/apikey")

def main():
    print("🔍 PaperFlow Deployment Status Checker")
    print("="*50)
    
    # Check prerequisites
    git_ready = check_git_status()
    files_ready = check_render_files()
    env_ready = check_environment_vars()
    
    print("\n" + "="*50)
    print("📊 DEPLOYMENT READINESS")
    print("="*50)
    
    if git_ready and files_ready and env_ready:
        print("🎉 READY FOR DEPLOYMENT!")
        print("\n🚀 Next steps:")
        print("1. Push to GitHub: git push origin main")
        print("2. Go to render.com and create Web Service")
        print("3. Connect your GitHub repo")
        print("4. Set environment variables")
        print("5. Deploy and test with your actual URL")
        
        print("\n💡 After deployment, test with:")
        print("   python check_deployment.py https://your-actual-render-url.onrender.com")
        
    else:
        print("❌ NOT READY FOR DEPLOYMENT")
        print("\n🔧 Fix the issues above first, then:")
        provide_deployment_guide()
    
    # Check if user might already have deployed
    print("\n" + "="*50)
    print("🤔 ALREADY DEPLOYED?")
    print("="*50)
    print("If you already deployed to Render:")
    print("1. Go to https://render.com dashboard")
    print("2. Find your PaperFlow service")
    print("3. Copy the URL (looks like: https://[service-name].onrender.com)")
    print("4. Test with: python check_deployment.py https://your-actual-url")
    print("\n⚠️  Don't use placeholder URLs like 'your-app.onrender.com'!")

if __name__ == "__main__":
    main()