const axios = require('axios');

async function createTestUser() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/signup', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Test user created:', response.data);
  } catch (error) {
    console.error('Error creating test user:', error.response ? error.response.data : error.message);
  }
}

createTestUser();