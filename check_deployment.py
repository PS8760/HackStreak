#!/usr/bin/env python3
"""
Comprehensive deployment status checker
"""

import requests
import sys
import time
import json

def check_deployment_status(base_url):
    """Check deployment status comprehensively"""
    print(f"🔍 Checking deployment status for: {base_url}")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Basic connectivity
    print("1️⃣ Testing basic connectivity...")
    try:
        response = requests.get(base_url, timeout=10)
        results['connectivity'] = {
            'status': response.status_code,
            'success': response.status_code < 400,
            'response_time': response.elapsed.total_seconds()
        }
        if response.status_code < 400:
            print(f"   ✅ Connected (Status: {response.status_code}, Time: {response.elapsed.total_seconds():.2f}s)")
        else:
            print(f"   ❌ Connection failed (Status: {response.status_code})")
    except Exception as e:
        results['connectivity'] = {'success': False, 'error': str(e)}
        print(f"   ❌ Connection error: {e}")
    
    # Test 2: Root endpoint
    print("2️⃣ Testing root endpoint (/)...")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        results['root'] = {
            'status': response.status_code,
            'success': response.status_code == 200
        }
        if response.status_code == 200:
            data = response.json()
            results['root']['data'] = data
            print(f"   ✅ Root endpoint works")
            print(f"   📋 App: {data.get('message', 'Unknown')}")
            print(f"   📋 Version: {data.get('version', 'Unknown')}")
        else:
            print(f"   ❌ Root endpoint failed (Status: {response.status_code})")
    except Exception as e:
        results['root'] = {'success': False, 'error': str(e)}
        print(f"   ❌ Root endpoint error: {e}")
    
    # Test 3: Health endpoint
    print("3️⃣ Testing health endpoint (/api/papers/health)...")
    try:
        response = requests.get(f"{base_url}/api/papers/health", timeout=10)
        results['health'] = {
            'status': response.status_code,
            'success': response.status_code == 200
        }
        if response.status_code == 200:
            data = response.json()
            results['health']['data'] = data
            print(f"   ✅ Health endpoint works")
            print(f"   🤖 Groq Integration: {data.get('features', {}).get('groq_integration', 'Unknown')}")
            print(f"   ⚡ Performance Mode: {data.get('performance_mode', 'Unknown')}")
        else:
            print(f"   ❌ Health endpoint failed (Status: {response.status_code})")
    except Exception as e:
        results['health'] = {'success': False, 'error': str(e)}
        print(f"   ❌ Health endpoint error: {e}")
    
    # Test 4: API Documentation
    print("4️⃣ Testing API documentation (/docs)...")
    try:
        response = requests.get(f"{base_url}/docs", timeout=10)
        results['docs'] = {
            'status': response.status_code,
            'success': response.status_code == 200
        }
        if response.status_code == 200:
            print(f"   ✅ API docs accessible")
        else:
            print(f"   ⚠️  API docs status: {response.status_code}")
    except Exception as e:
        results['docs'] = {'success': False, 'error': str(e)}
        print(f"   ⚠️  API docs error: {e}")
    
    # Test 5: Paper generation (template mode)
    print("5️⃣ Testing paper generation (template mode)...")
    try:
        test_data = {
            "title": "Deployment Test Paper",
            "sections": ["Abstract", "Introduction"],
            "use_ai": False  # Use templates for faster testing
        }
        response = requests.post(f"{base_url}/api/papers/generate", json=test_data, timeout=30)
        results['generation'] = {
            'status': response.status_code,
            'success': response.status_code == 200
        }
        if response.status_code == 200:
            data = response.json()
            sections = data.get('data', {}).get('sections', {})
            print(f"   ✅ Paper generation works ({len(sections)} sections)")
            print(f"   📄 Generated: {', '.join(sections.keys())}")
        else:
            print(f"   ❌ Paper generation failed (Status: {response.status_code})")
            try:
                error_data = response.json()
                print(f"   📋 Error: {error_data.get('message', 'Unknown error')}")
            except:
                pass
    except Exception as e:
        results['generation'] = {'success': False, 'error': str(e)}
        print(f"   ❌ Paper generation error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DEPLOYMENT STATUS SUMMARY")
    print("=" * 60)
    
    total_tests = 5
    passed_tests = sum(1 for test in results.values() if test.get('success', False))
    
    print(f"✅ Passed: {passed_tests}/{total_tests} tests")
    
    if passed_tests == total_tests:
        print("🎉 DEPLOYMENT SUCCESSFUL - All systems operational!")
        return True
    elif passed_tests >= 3:
        print("⚠️  DEPLOYMENT PARTIAL - Core functionality works")
        return True
    else:
        print("❌ DEPLOYMENT FAILED - Critical issues detected")
        return False

def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        print("Usage: python check_deployment.py <URL>")
        print("Example: python check_deployment.py https://paperflow-backend-abc123.onrender.com")
        print("\n❌ You need your ACTUAL Render app URL, not a placeholder!")
        print("\n📋 To find your URL:")
        print("1. Go to https://render.com dashboard")
        print("2. Click on your PaperFlow service")
        print("3. Copy the URL (looks like: https://[service-name].onrender.com)")
        print("\n🚀 Or deploy first if you haven't:")
        print("1. Push code to GitHub: git push origin main")
        print("2. Go to render.com → New Web Service")
        print("3. Connect your GitHub repo")
        print("4. Set environment variables: GROQ_API_KEY, GEMINI_API_KEY")
        print("5. Deploy and get the URL")
        sys.exit(1)
    
    # Check for placeholder URLs
    placeholder_urls = [
        "your-app.onrender.com",
        "your-actual-app.onrender.com", 
        "paperflow-backend-xyz.onrender.com",
        "example.onrender.com"
    ]
    
    if any(placeholder in url for placeholder in placeholder_urls):
        print("❌ This looks like a placeholder URL!")
        print(f"   You used: {url}")
        print("\n🔍 You need your ACTUAL Render app URL:")
        print("1. Go to https://render.com dashboard")
        print("2. Find your deployed service")
        print("3. Copy the real URL (e.g., https://paperflow-backend-abc123.onrender.com)")
        print("\n💡 If you haven't deployed yet:")
        print("   Run: git push origin main")
        print("   Then create a Web Service on Render")
        sys.exit(1)
    
    if not url.startswith('http'):
        url = f"https://{url}"
    
    success = check_deployment_status(url)
    
    if success:
        print(f"\n🌐 Your app is live at: {url}")
        print("📚 API Documentation: {}/docs".format(url))
        print("🔍 Health Check: {}/api/papers/health".format(url))
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()