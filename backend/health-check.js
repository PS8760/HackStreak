import fetch from 'node-fetch';

async function checkHealth() {
  try {
    console.log('🔍 Checking backend health...');
    
    // Check if server is running
    const response = await fetch('http://localhost:5000/api/papers/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is running successfully!');
      console.log('📊 Health check response:', data);
    } else {
      console.log('❌ Backend returned error:', data);
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Error:', error.message);
    console.log('\n💡 To start the backend:');
    console.log('   cd backend');
    console.log('   npm run dev');
  }
}

checkHealth();