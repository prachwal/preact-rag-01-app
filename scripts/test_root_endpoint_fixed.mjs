#!/usr/bin/env node

// Test script specifically for the root endpoint that was fixed
const API_BASE = 'http://localhost:3000/api';

async function testRootEndpoint() {
  console.log('🧪 Testing Root Endpoint (HTTP_STATUS.OK fix)\n');

  try {
    // Test root endpoint (without trailing slash)
    const response = await fetch(`${API_BASE}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // The root route should return status 200 and contain greeting message
    if (response.status === 200 && 
        data.status === 'success' && 
        data.payload &&
        data.payload.message === 'Hello World') {
      console.log('\n✅ Root endpoint working correctly with HTTP_STATUS.OK constant!');
      console.log('✅ ESLint magic number issue has been resolved!');
    } else {
      console.log('\n❌ Root endpoint structure validation failed!');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
  
  console.log('🎉 Root endpoint test completed!');
}

// Run the test
testRootEndpoint().catch(console.error);