#!/usr/bin/env python3
"""
Force Python version check and compatibility
"""

import sys
import subprocess

def check_python_version():
    """Check Python version and warn if incompatible"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 13:
        print("⚠️  WARNING: Python 3.13+ detected - known compatibility issues")
        print("🔧 Attempting to use compatible package versions...")
        return False
    elif version.major == 3 and version.minor >= 11:
        print("✅ Python 3.11+ detected - should be compatible")
        return True
    else:
        print("⚠️  Python version might be too old")
        return True

def install_compatible_packages():
    """Install the most compatible package versions"""
    packages = [
        "fastapi==0.88.0",
        "uvicorn==0.20.0", 
        "httpx==0.23.3",
        "python-dotenv==1.0.0",
        "pydantic==1.10.2",
        "typing-extensions==4.4.0"
    ]
    
    print("📦 Installing ultra-compatible packages...")
    for package in packages:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", package], 
                         check=True, capture_output=True)
            print(f"✅ {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    return True

def test_imports():
    """Test critical imports"""
    try:
        print("🧪 Testing imports...")
        
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__}")
        
        import httpx
        print(f"✅ HTTPX {httpx.__version__}")
        
        import pydantic
        print(f"✅ Pydantic {pydantic.VERSION}")
        
        # Test FastAPI app creation
        app = fastapi.FastAPI(title="Test")
        print("✅ FastAPI app creation successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def main():
    print("🔧 PYTHON VERSION COMPATIBILITY CHECKER")
    print("=" * 50)
    
    # Check Python version
    is_compatible = check_python_version()
    
    if not is_compatible:
        print("\n🔄 Installing compatible packages...")
        if not install_compatible_packages():
            print("❌ Failed to install compatible packages")
            return False
    
    # Test imports
    print("\n🧪 Testing package compatibility...")
    if test_imports():
        print("\n🎉 All packages are compatible!")
        return True
    else:
        print("\n❌ Package compatibility test failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)