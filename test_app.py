#!/usr/bin/env python3
"""
Test script to verify the app can start
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_python'))

try:
    print("🧪 Testing app import...")
    from groq_httpx_ultra import app
    print("✅ FastAPI app imported successfully")
    
    # Test basic app properties
    print(f"📋 App title: {app.title}")
    print(f"📋 App version: {app.version}")
    
    # Test routes
    routes = [route.path for route in app.routes]
    print(f"🛣️  Available routes: {len(routes)}")
    for route in routes[:5]:  # Show first 5 routes
        print(f"   - {route}")
    
    print("✅ App test passed!")
    
except ImportError as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ App test failed: {e}")
    sys.exit(1)