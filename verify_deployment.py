#!/usr/bin/env python3
"""
Verify deployment is working correctly
"""

import requests
import sys
import time

def test_deployment(base_url):
    """Test deployment endpoints"""
    print(f"🧪 Testing deployment at {base_url}")
    
    # Test health endpoint
    try:
        print("🔍 Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test API docs
    try:
        print("🔍 Testing API docs...")
        response = requests.get(f"{base_url}/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API docs accessible")
        else:
            print(f"⚠️  API docs status: {response.status_code}")
    except Exception as e:
        print(f"⚠️  API docs error: {e}")
    
    # Test paper generation
    try:
        print("🔍 Testing paper generation...")
        test_data = {
            "title": "Test Paper",
            "sections": ["Abstract", "Introduction"],
            "use_ai": False  # Use template for faster testing
        }
        response = requests.post(f"{base_url}/api/papers/generate", json=test_data, timeout=30)
        if response.status_code == 200:
            print("✅ Paper generation works")
        else:
            print(f"❌ Paper generation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Paper generation error: {e}")
        return False
    
    print("🎉 All tests passed!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter your Render app URL (e.g., https://your-app.onrender.com): ").strip()
    
    if not url.startswith('http'):
        url = f"https://{url}"
    
    success = test_deployment(url)
    sys.exit(0 if success else 1)