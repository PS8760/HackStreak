#!/usr/bin/env python3
"""
Test the deployed backend on Render
"""

import requests
import sys
import time

def test_endpoint(url, endpoint, method='GET', data=None):
    """Test a specific endpoint"""
    full_url = f"{url}{endpoint}"
    try:
        print(f"🔍 Testing {method} {full_url}")
        
        if method == 'GET':
            response = requests.get(full_url, timeout=30)
        elif method == 'POST':
            response = requests.post(full_url, json=data, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                print(f"✅ Response: {json_data}")
                return True
            except:
                print(f"✅ Response received (non-JSON)")
                return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Error: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (30s)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - service might be starting up")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend(base_url):
    """Test the backend deployment"""
    print(f"🧪 Testing Backend Deployment: {base_url}")
    print("=" * 60)
    
    # Remove trailing slash
    if base_url.endswith('/'):
        base_url = base_url[:-1]
    
    tests = [
        ("Root endpoint", "/", "GET"),
        ("Health check", "/health", "GET"),
        ("API health", "/api/health", "GET"),
    ]
    
    results = []
    
    for test_name, endpoint, method in tests:
        print(f"\n📋 {test_name}")
        success = test_endpoint(base_url, endpoint, method)
        results.append((test_name, success))
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Backend is working correctly.")
        return True
    elif passed > 0:
        print("\n⚠️  Some tests passed. Backend might be partially working.")
        return True
    else:
        print("\n❌ All tests failed. Check your deployment.")
        return False

def main():
    print("🚀 BACKEND DEPLOYMENT TESTER")
    print("This script tests your deployed backend on Render")
    
    # Get backend URL
    backend_url = input("\nEnter your Render backend URL (e.g., https://your-service.onrender.com): ").strip()
    
    if not backend_url:
        print("❌ Backend URL is required")
        return False
    
    if not backend_url.startswith('http'):
        backend_url = f"https://{backend_url}"
    
    print(f"\n🔗 Testing backend at: {backend_url}")
    
    # Test the backend
    success = test_backend(backend_url)
    
    if success:
        print(f"\n🎉 Backend deployment successful!")
        print(f"🌐 Your backend: {backend_url}")
        print(f"🔗 API base URL: {backend_url}/api")
        print("\n📋 Next steps:")
        print("1. Update your frontend VITE_API_BASE_URL")
        print("2. Test paper generation functionality")
        print("3. Monitor logs for any issues")
    else:
        print(f"\n❌ Backend deployment needs attention")
        print("Check Render logs for detailed error information")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)