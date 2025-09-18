#!/usr/bin/env python3
"""
Quick script to test if the deployment is working
"""
import httpx
import sys

def test_deployment(url):
    """Test if the deployed service is responding"""
    try:
        print(f"🔍 Testing deployment at: {url}")
        
        # Test health endpoint
        response = httpx.get(f"{url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
        # Test root endpoint
        response = httpx.get(url, timeout=10)
        if response.status_code == 200:
            print("✅ Root endpoint working!")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"❌ Deployment test failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter your Render service URL: ").strip()
    
    if not url.startswith('http'):
        url = f"https://{url}"
    
    test_deployment(url)