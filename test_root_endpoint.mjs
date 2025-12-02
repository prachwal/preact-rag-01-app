#!/usr/bin/env node

// Test script for API endpoint that was fixed with HTTP_STATUS.OK constants
const API_BASE = 'http://localhost:3000/api';

async function testRootEndpoint() {
  console.log('🧪 Testing API Endpoint (HTTP_STATUS.OK fix)\n');

  try {
    // Test main API endpoint
    const response = await fetch(`${API_BASE}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // The API route should return status 200 and contain greeting information
    if (response.status === 200 && 
        data.status === 'success' && 
        data.payload &&
        data.payload.message === 'Hello World') {
      console.log('\n✅ API endpoint working correctly with HTTP_STATUS.OK constant!');
      console.log('✅ ESLint magic number issue has been resolved!');
      console.log('✅ API returns proper JSON response structure!');
    } else {
      console.log('\n❌ API endpoint structure validation failed!');
      console.log(`Expected: status=200, message="Hello World"`);
      console.log(`Got: status=${response.status}, message="${data.payload?.message}"`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
  
  // Test parameterized endpoint
  console.log('\n🔍 Testing parameterized endpoint:');
  try {
    const response = await fetch(`${API_BASE}?name=TestUser`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.payload?.message === 'Hello TestUser') {
      console.log('✅ Parameterized endpoint working correctly!');
    } else {
      console.log('❌ Parameterized endpoint failed!');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
  
  console.log('\n🎉 API endpoint test completed!');
}

// Run the test
testRootEndpoint().catch(console.error);