import axios from 'axios';

// Function to test API endpoints
export const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // List of potential endpoints to test
  const endpoints = [
    '/login',
    '/signin',
    '/signup',
    '/register',
    '/api/auth/login',
    '/api/auth/signin',
    '/api/auth/signup',
    '/auth/login',
    '/auth/signin',
    '/auth/signup'
  ];
  
  console.log('Starting API endpoint tests...');
  
  for (const endpoint of endpoints) {
    try {
      // Try a simple OPTIONS request to check if endpoint exists
      await axios.options(`${baseUrl}${endpoint}`);
      console.log(`✅ Endpoint ${endpoint} exists`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log(`❌ Endpoint ${endpoint} not found (404)`);
        } else {
          // Other status codes might indicate the endpoint exists but requires authentication
          console.log(`⚠️ Endpoint ${endpoint} returned status ${error.response.status}`);
        }
      } else {
        console.log(`❌ Error testing ${endpoint}: ${error.message}`);
      }
    }
  }
  
  console.log('API endpoint tests completed');
};

// You can run this function from your browser console:
// import { testEndpoints } from './utils/apiTest'
// testEndpoints()
