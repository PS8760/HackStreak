#!/usr/bin/env python3
"""
PaperFlow Installation Script
Sets up the complete environment for new users
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
        print(f"✅ {cmd}")
        return True
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def check_python():
    """Check Python version"""
    print("🐍 Checking Python version...")
    try:
        version = sys.version_info
        if version.major == 3 and version.minor >= 8:
            print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
            return True
        else:
            print(f"❌ Python {version.major}.{version.minor}.{version.micro} is too old. Need Python 3.8+")
            return False
    except Exception as e:
        print(f"❌ Error checking Python version: {e}")
        return False

def check_node():
    """Check Node.js version"""
    print("📦 Checking Node.js version...")
    return run_command("node --version")

def install_python_deps():
    """Install Python dependencies"""
    print("🔧 Installing Python dependencies...")
    
    # Check if virtual environment should be created
    if not os.path.exists('venv') and not os.environ.get('VIRTUAL_ENV'):
        print("Creating virtual environment...")
        if not run_command("python -m venv venv"):
            return False
        
        # Activate virtual environment
        if os.name == 'nt':  # Windows
            activate_cmd = "venv\\Scripts\\activate && "
        else:  # Unix/Linux/macOS
            activate_cmd = "source venv/bin/activate && "
        
        print("Installing dependencies in virtual environment...")
        return run_command(f"{activate_cmd}pip install -r requirements.txt")
    else:
        print("Installing dependencies...")
        return run_command("pip install -r requirements.txt")

def install_node_deps():
    """Install Node.js dependencies"""
    print("📦 Installing Node.js dependencies...")
    return run_command("npm install")

def setup_environment():
    """Setup environment variables"""
    print("🔧 Setting up environment...")
    
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists() and env_example.exists():
        shutil.copy(env_example, env_file)
        print("📝 Created .env file from template")
        print("⚠️  Please edit .env file with your API keys:")
        print("   - GROQ_API_KEY: Get from https://console.groq.com/")
        print("   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("❌ No .env.example file found")
        return False

def main():
    """Main installation function"""
    print("🚀 PaperFlow Installation Script")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python():
        print("\n❌ Installation failed: Python version incompatible")
        return False
    
    if not check_node():
        print("\n❌ Installation failed: Node.js not found")
        print("Please install Node.js 16+ from https://nodejs.org/")
        return False
    
    # Install dependencies
    print("\n📦 Installing Dependencies...")
    
    if not install_python_deps():
        print("\n❌ Installation failed: Python dependencies")
        return False
    
    if not install_node_deps():
        print("\n❌ Installation failed: Node.js dependencies")
        return False
    
    # Setup environment
    if not setup_environment():
        print("\n❌ Installation failed: Environment setup")
        return False
    
    print("\n🎉 Installation Complete!")
    print("=" * 40)
    print("Next steps:")
    print("1. Edit .env file with your API keys")
    print("2. Run: python start.py")
    print("3. Open: http://localhost:5173")
    print("\nFor deployment: python deploy.py docker")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)