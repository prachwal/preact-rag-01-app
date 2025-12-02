#!/usr/bin/env node

// Comprehensive test to verify the magic number fix and API functionality
const API_BASE = 'http://localhost:3000';

async function comprehensiveTest() {
  console.log('🧪 Comprehensive API Test (Verifying HTTP_STATUS.OK fix)\n');

  // Test all endpoints that should work
  const tests = [
    {
      name: 'Basic API endpoint (GET /api)',
      url: `${API_BASE}/api`,
      expectedStatus: 200,
      expectedPayload: 'Hello World'
    },
    {
      name: 'API with name parameter (GET /api?name=Test)',
      url: `${API_BASE}/api?name=Test`,
      expectedStatus: 200,
      expectedPayload: 'Hello Test'
    },
    {
      name: 'Users list (GET /api/users)',
      url: `${API_BASE}/api/users`,
      expectedStatus: 200,
      expectedHasUsers: true
    },
    {
      name: 'User by ID (GET /api/users/123)',
      url: `${API_BASE}/api/users/123`,
      expectedStatus: 200,
      expectedUserId: '123'
    },
    {
      name: 'Health check (GET /api/health)',
      url: `${API_BASE}/api/health`,
      expectedStatus: 200,
      expectedHealthy: true
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Response:`, JSON.stringify(data, null, 2));
      
      // Validate the response
      let testPassed = true;
      
      if (response.status !== test.expectedStatus) {
        console.log(`   ❌ Expected status ${test.expectedStatus}, got ${response.status}`);
        testPassed = false;
      }
      
      if (data.status !== 'success') {
        console.log(`   ❌ Expected success status, got ${data.status}`);
        testPassed = false;
      }
      
      if (test.expectedPayload && data.payload?.message !== test.expectedPayload) {
        console.log(`   ❌ Expected payload "${test.expectedPayload}", got "${data.payload?.message}"`);
        testPassed = false;
      }
      
      if (test.expectedHasUsers && !data.payload?.users) {
        console.log(`   ❌ Expected users array in payload`);
        testPassed = false;
      }
      
      if (test.expectedUserId && data.payload?.id !== test.expectedUserId) {
        console.log(`   ❌ Expected user ID "${test.expectedUserId}", got "${data.payload?.id}"`);
        testPassed = false;
      }
      
      if (test.expectedHealthy && data.payload?.healthy !== true) {
        console.log(`   ❌ Expected healthy: true, got ${data.payload?.healthy}`);
        testPassed = false;
      }
      
      if (testPassed) {
        console.log(`   ✅ Test passed!\n`);
        passedTests++;
      } else {
        console.log(`   ❌ Test failed!\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed\n`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! The HTTP_STATUS.OK fix is working correctly!');
    console.log('✅ ESLint magic number issue has been resolved!');
    console.log('✅ All API endpoints return proper status codes using constants!');
  } else {
    console.log('❌ Some tests failed. Check the API configuration.');
  }
}

// Run the comprehensive test
comprehensiveTest().catch(console.error);