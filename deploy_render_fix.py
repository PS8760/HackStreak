#!/usr/bin/env python3
"""
Quick deployment fix for Render - handles the Python 3.13 compatibility issue
"""

import subprocess
import sys

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Deploying Render fix for Python 3.13 compatibility...")
    
    # Add all changes
    if not run_command("git add ."):
        return False
    
    # Commit changes
    if not run_command('git commit -m "Fix Python 3.13 compatibility: force Python 3.11 and use ultra-minimal requirements"'):
        return False
    
    # Push to main
    if not run_command("git push origin main"):
        return False
    
    print("\n🎉 Deployment fix pushed successfully!")
    print("\n📋 Next steps:")
    print("1. Go to your Render dashboard")
    print("2. Your service should auto-deploy with the new changes")
    print("3. Monitor the build logs - should use Python 3.11.9 now")
    print("4. The build should succeed with ultra-minimal requirements")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)