#!/usr/bin/env python3
"""
Test the deployed frontend
"""

import requests
import sys

def test_frontend(url):
    """Test if the frontend is accessible"""
    try:
        print(f"🔍 Testing frontend at: {url}")
        
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible!")
            print(f"Status: {response.status_code}")
            
            # Check if it's a React app
            if 'react' in response.text.lower() or 'vite' in response.text.lower():
                print("✅ React/Vite app detected")
            
            # Check for PaperFlow title
            if 'paperflow' in response.text.lower():
                print("✅ PaperFlow app detected")
            
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False

def main():
    frontend_url = "https://paperflow-frontend-gx1ec6i85-ps8760s-projects.vercel.app"
    
    print("🧪 Testing PaperFlow Frontend Deployment")
    print("=" * 50)
    
    success = test_frontend(frontend_url)
    
    if success:
        print("\n🎉 Frontend deployment test passed!")
        print(f"🌐 Visit your app: {frontend_url}")
    else:
        print("\n❌ Frontend deployment test failed!")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)