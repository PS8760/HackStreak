#!/usr/bin/env python3
"""
Terminal-guided Render deployment for PaperFlow backend
"""

import subprocess
import sys
import time
import webbrowser

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

def print_step(step_num, title):
    """Print a formatted step"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    print(f"{'='*60}")

def wait_for_user():
    """Wait for user confirmation"""
    input("\nPress Enter to continue...")

def main():
    print("🚀 RENDER BACKEND DEPLOYMENT GUIDE")
    print("This script will guide you through deploying your backend to Render")
    
    # Step 1: Verify repository
    print_step(1, "VERIFY REPOSITORY STATUS")
    
    if not run_command("git status --porcelain"):
        print("✅ Repository is clean and ready for deployment")
    else:
        print("⚠️  There are uncommitted changes")
    
    # Get repository URL
    result = subprocess.run("git remote get-url origin", shell=True, capture_output=True, text=True)
    repo_url = result.stdout.strip()
    print(f"📂 Repository: {repo_url}")
    
    wait_for_user()
    
    # Step 2: Open Render dashboard
    print_step(2, "OPEN RENDER DASHBOARD")
    
    render_url = "https://render.com/dashboard"
    print(f"🌐 Opening Render dashboard: {render_url}")
    
    try:
        webbrowser.open(render_url)
        print("✅ Render dashboard opened in browser")
    except:
        print(f"❌ Could not open browser. Please manually visit: {render_url}")
    
    print("\n📋 In the Render dashboard:")
    print("1. Click 'New +' button")
    print("2. Select 'Web Service'")
    print("3. Connect your GitHub account if not already connected")
    
    wait_for_user()
    
    # Step 3: Repository configuration
    print_step(3, "CONFIGURE REPOSITORY")
    
    print("📋 Repository Configuration:")
    print(f"• Repository: {repo_url}")
    print("• Branch: main")
    print("• Root Directory: ResearchPaper")
    print("\n⚠️  IMPORTANT: Set 'Root Directory' to 'ResearchPaper'")
    
    wait_for_user()
    
    # Step 4: Service configuration
    print_step(4, "SERVICE CONFIGURATION")
    
    print("📋 Service Settings:")
    print("• Name: paperflow-backend (or your preferred name)")
    print("• Environment: Python 3")
    print("• Region: Oregon (US West) or closest to you")
    print("• Branch: main")
    print("• Root Directory: ResearchPaper")
    
    wait_for_user()
    
    # Step 5: Build configuration
    print_step(5, "BUILD & DEPLOY CONFIGURATION")
    
    print("📋 Build & Deploy Settings:")
    print("Build Command:")
    print("pip install --upgrade pip && pip install --no-cache-dir --force-reinstall -r requirements-ultra-minimal.txt && python verify_minimal_build.py")
    print("\nStart Command:")
    print("python start_render.py")
    
    print("\n⚠️  Copy these commands exactly as shown above!")
    
    wait_for_user()
    
    # Step 6: Environment variables
    print_step(6, "ENVIRONMENT VARIABLES")
    
    print("📋 Add these Environment Variables:")
    print("• PORT = 10000")
    print("• HOST = 0.0.0.0")
    print("• ENVIRONMENT = production")
    print("• GROQ_API_KEY = your_actual_groq_api_key")
    print("• GEMINI_API_KEY = your_actual_gemini_api_key (optional)")
    
    print("\n⚠️  Make sure to add your actual API keys!")
    
    wait_for_user()
    
    # Step 7: Deploy
    print_step(7, "DEPLOY SERVICE")
    
    print("📋 Final Steps:")
    print("1. Review all settings")
    print("2. Click 'Create Web Service'")
    print("3. Wait for deployment to complete (3-5 minutes)")
    print("4. Monitor build logs for any errors")
    
    print("\n🔍 Expected Build Process:")
    print("• Installing Python 3.11.9...")
    print("• Installing dependencies from requirements-ultra-minimal.txt...")
    print("• Running verification script...")
    print("• Starting service with start_render.py...")
    
    wait_for_user()
    
    # Step 8: Post-deployment
    print_step(8, "POST-DEPLOYMENT")
    
    print("📋 After Successful Deployment:")
    print("1. Copy your Render service URL")
    print("2. Test the backend endpoints")
    print("3. Update frontend environment variables")
    
    print("\n🧪 Test your backend:")
    print("curl https://your-service-name.onrender.com/health")
    
    print("\n🔗 Update frontend:")
    print("Set VITE_API_BASE_URL to: https://your-service-name.onrender.com/api")
    
    print("\n🎉 Deployment Complete!")
    print("Your backend should now be live and ready to handle requests!")
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Deployment guide cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)