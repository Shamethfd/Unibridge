import axios from 'axios';

async function testBackend() {
  try {
    console.log('Testing backend health...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test registration endpoint
    console.log('\nTesting registration endpoint...');
    const testData = {
      username: 'testuser123',
      email: 'test123@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    try {
      const regResponse = await axios.post('http://localhost:5000/api/auth/register', testData);
      console.log('✅ Registration successful:', regResponse.data);
    } catch (regError) {
      console.log('❌ Registration failed:', regError.response?.data || regError.message);
    }
    
  } catch (error) {
    console.error('❌ Backend not accessible:', error.message);
    console.log('Make sure backend is running on port 5000');
  }
}

testBackend();
