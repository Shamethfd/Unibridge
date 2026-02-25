import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log('=== LearnBridge Backend Startup ===');
console.log('Environment variables:');
console.log('- MONGODBURL:', process.env.MONGODBURL ? '✅ Set' : '❌ Missing');
console.log('- PORT:', process.env.PORT || '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN || '❌ Missing');

try {
  console.log('\nStarting server...');
  await import('./app.js');
  console.log('✅ Server started successfully');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Full error:', error);
}
