#!/usr/bin/env python3
"""
Interactive Render deployment helper
"""

import os
import subprocess
import sys
import webbrowser

def run_command(cmd, description):
    """Run a command and show the result"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} error: {e}")
        return False

def check_api_keys():
    """Check if API keys are properly set"""
    if not os.path.exists('.env'):
        print("❌ No .env file found")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
    
    if 'your_groq_api_key_here' in content or 'your_gemini_api_key_here' in content:
        print("❌ API keys not set in .env file")
        print("📝 Please edit .env file with your actual API keys:")
        print("   GROQ_API_KEY=your_actual_groq_key")
        print("   GEMINI_API_KEY=your_actual_gemini_key")
        return False
    
    return True

def main():
    print("🚀 PaperFlow Render Deployment Helper")
    print("="*50)
    
    # Step 1: Check API keys
    print("\n1️⃣ Checking API keys...")
    if not check_api_keys():
        print("\n🔑 Get your API keys:")
        print("   Groq: https://console.groq.com/")
        print("   Gemini: https://makersuite.google.com/app/apikey")
        print("\n📝 Then edit .env file with your keys")
        return
    print("✅ API keys are set")
    
    # Step 2: Commit changes
    print("\n2️⃣ Preparing Git repository...")
    if not run_command("git add .", "Adding files to Git"):
        return
    
    if not run_command("git commit -m 'Deploy to Render'", "Committing changes"):
        print("ℹ️  No changes to commit (this is okay)")
    
    # Step 3: Push to GitHub
    print("\n3️⃣ Pushing to GitHub...")
    if not run_command("git push origin main", "Pushing to GitHub"):
        print("❌ Failed to push to GitHub")
        print("📝 Make sure you have a GitHub remote configured:")
        print("   git remote add origin https://github.com/yourusername/your-repo.git")
        return
    
    # Step 4: Open Render
    print("\n4️⃣ Opening Render dashboard...")
    print("🌐 Opening https://render.com in your browser...")
    webbrowser.open("https://render.com")
    
    print("\n📋 MANUAL STEPS ON RENDER:")
    print("="*40)
    print("1. Sign up/Login to Render (can use GitHub)")
    print("2. Click 'New +' → 'Web Service'")
    print("3. Connect your GitHub repository")
    print("4. Render should auto-detect render.yaml")
    print("5. Set environment variables:")
    print("   - GROQ_API_KEY = your_actual_groq_key")
    print("   - GEMINI_API_KEY = your_actual_gemini_key")
    print("6. Click 'Create Web Service'")
    print("7. Wait for deployment (~3-5 minutes)")
    print("8. Copy your app URL")
    
    print("\n⏳ After deployment completes:")
    print("   python check_deployment.py https://your-actual-render-url.onrender.com")
    
    # Step 5: Wait for user input
    input("\n⏸️  Press Enter after you've completed the Render deployment...")
    
    # Step 6: Get URL and test
    print("\n5️⃣ Testing deployment...")
    url = input("📝 Enter your Render app URL: ").strip()
    
    if not url:
        print("❌ No URL provided")
        return
    
    if not url.startswith('http'):
        url = f"https://{url}"
    
    print(f"\n🧪 Testing deployment at {url}...")
    
    # Run the deployment checker
    os.system(f"python check_deployment.py {url}")

if __name__ == "__main__":
    main()