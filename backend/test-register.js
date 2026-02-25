import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log('Testing registration endpoint...');
console.log('API URL would be:', process.env.CORS_ORIGIN);

// Test data
const testData = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  phone: '1234567890',
  bio: 'Test user for registration'
};

console.log('Test registration data:', testData);

// Test if we can import the controller
try {
  const { register } = await import('./controllers/authController.js');
  console.log('✅ Auth controller imported successfully');
  
  // Mock request and response
  const mockReq = {
    body: testData
  };
  
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        console.log(`Response status: ${code}`);
        console.log('Response data:', JSON.stringify(data, null, 2));
      }
    })
  };
  
  console.log('\nTesting registration function...');
  await register(mockReq, mockRes);
  
} catch (error) {
  console.error('❌ Error importing controller:', error.message);
}
