#!/usr/bin/env python3
"""
Verify that minimal requirements can be installed and imported successfully
"""

def test_imports():
    """Test that all required packages can be imported"""
    import sys
    print(f"🐍 Python version: {sys.version}")
    
    try:
        # Test core dependencies one by one
        print("Testing imports...")
        
        import typing_extensions
        print(f"✅ typing-extensions {typing_extensions.__version__}")
        
        import pydantic
        print(f"✅ Pydantic {pydantic.VERSION}")
        
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__}")
        
        import httpx
        print(f"✅ HTTPX {httpx.__version__}")
        
        import dotenv
        print("✅ Python-dotenv imported")
        
        # Test FastAPI app creation
        app = fastapi.FastAPI(title="Test App")
        print("✅ FastAPI app creation successful")
        
        print("\n🎉 All minimal requirements imported successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Import/test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_imports()
    exit(0 if success else 1)