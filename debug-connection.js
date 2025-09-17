// Simple connection test script
async function testConnection() {
  console.log('🔍 Testing connection to backend...');
  
  try {
    // Test basic fetch to backend
    const response = await fetch('http://localhost:5000/api/papers/health');
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is accessible!');
      console.log('📊 Response data:', data);
    } else {
      console.log('❌ Backend returned error status:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔧 Possible issues:');
    console.log('   1. Backend server is not running');
    console.log('   2. Backend is running on different port');
    console.log('   3. CORS configuration issue');
    console.log('   4. Firewall blocking connection');
  }
}

// Run the test
testConnection();