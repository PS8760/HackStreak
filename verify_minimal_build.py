#!/usr/bin/env python3
"""
Verify that minimal requirements can be installed and imported successfully
"""

def test_imports():
    """Test that all required packages can be imported"""
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__}")
        
        import httpx
        print(f"✅ HTTPX {httpx.__version__}")
        
        import pydantic
        print(f"✅ Pydantic {pydantic.VERSION}")
        
        import dotenv
        print("✅ Python-dotenv imported")
        
        print("\n🎉 All minimal requirements imported successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    exit(0 if success else 1)