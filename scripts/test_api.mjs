#!/usr/bin/env node

// Test script for Netlify function
const API_BASE = 'http://localhost:3000/api';

async function testApi() {
  console.log('🧪 Testing Netlify Function API\n');

  // Test 1: Basic request
  console.log('1️⃣ Testing basic request:');
  try {
    const response = await fetch(`${API_BASE}`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (data.status === 'success' && data.payload && data.metadata) {
      console.log('✅ Response structure is valid!\n');
    } else {
      console.log('❌ Response structure is invalid!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2: Request with name parameter
  console.log('2️⃣ Testing request with name parameter:');
  try {
    const response = await fetch(`${API_BASE}?name=Jan`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.payload?.message === 'Hello Jan') {
      console.log('✅ Name parameter works correctly!\n');
    } else {
      console.log('❌ Name parameter not working!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 3: Error handling simulation  
  console.log('3️⃣ Testing error handling scenarios:');
  
  // Test 3a: Empty parameter handling
  console.log('   🔸 Testing empty parameter handling...');
  try {
    const response = await fetch(`${API_BASE}?name=`); // Empty name parameter
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.payload?.message === 'Hello World') {
      console.log('✅ Empty parameter handled correctly (falls back to default)!\n');
    } else {
      console.log('❌ Unexpected response for empty parameter!\n');
    }
  } catch (error) {
    console.log(`❌ Error with empty parameter: ${error.message}\n`);
  }

  // Test 3b: Invalid URL test
  console.log('   🔸 Testing invalid URL handling...');
  try {
    // Create an invalid URL to test error handling
    const response = await fetch(`${API_BASE}?name=${encodeURIComponent('test%invalid')}`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // The function should handle this gracefully
    if (data.status === 'success') {
      console.log('✅ Invalid URL parameter handled gracefully!\n');
    }
  } catch (error) {
    console.log(`🧪 URL error handling triggered: ${error.message}\n`);
  }

  // Test 4: Response headers and metadata validation
  console.log('4️⃣ Testing response headers and metadata:');
  try {
    const response = await fetch(`${API_BASE}?name=HeaderTest`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // Validate metadata structure (timestamp and version are required)
    const { metadata } = data;
    const hasRequiredMetadataFields = metadata.timestamp && metadata.version;
    
    if (hasRequiredMetadataFields) {
      console.log('✅ Required metadata fields present!');
      console.log(`   - Timestamp: ${metadata.timestamp}`);
      console.log(`   - Version: ${metadata.version}`);
      if (metadata.requestId) {
        console.log(`   - Request ID: ${metadata.requestId}`);
      }
      if (metadata.processingTimeMs !== undefined) {
        console.log(`   - Processing Time: ${metadata.processingTimeMs}ms`);
      }
    } else {
      console.log('❌ Missing required metadata fields!');
    }
    
    // Validate response has proper structure
    if (data.status === 'success' && data.payload && data.metadata) {
      console.log('✅ Response structure is industrial-standard compliant!\n');
    } else {
      console.log('❌ Response structure validation failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 5: Custom header testing (error triggering)
  console.log('5️⃣ Testing custom header functionality:');
  try {
    const response = await fetch(`${API_BASE}?name=HeaderTest`, {
      headers: {
        'x-trigger-error': 'true'
      }
    });
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'error' && data.error?.message.includes('x-trigger-error header')) {
      console.log('✅ Custom header error triggering works correctly!\n');
    } else {
      console.log('❌ Custom header error triggering failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 6: CORS headers
  console.log('6️⃣ Testing CORS headers:');
  try {
    const response = await fetch(`${API_BASE}`, {
      method: 'OPTIONS'
    });
    console.log(`✅ Status: ${response.status}`);
    console.log(`🌐 CORS headers:`);
    console.log(`   - Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`   - Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    console.log(`   - Access-Control-Allow-Headers: ${response.headers.get('access-control-allow-headers')}`);
    
    const allowedHeaders = response.headers.get('access-control-allow-headers');
    if (allowedHeaders?.includes('x-trigger-error')) {
      console.log('✅ Custom header included in CORS configuration!\n');
    } else {
      console.log('❌ Custom header not included in CORS!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 7: Redirect functionality (Development Environment)
  console.log('7️⃣ Testing redirect functionality (Dev environment):');
  try {
    // Test the direct function URL (this should work)
    const directUrl = 'http://localhost:3000/api?name=DirectTest';
    const response = await fetch(directUrl);
    console.log(`✅ Direct function URL Status: ${response.status}`);
    
    const data = await response.json();
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.payload?.message === 'Hello DirectTest') {
      console.log('✅ Direct function access works correctly!\n');
    } else {
      console.log('❌ Direct function access failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 8: Users endpoint
  console.log('8️⃣ Testing users endpoint:');
  try {
    const response = await fetch(`${API_BASE}/users`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.payload?.users) {
      console.log('✅ Users list endpoint works correctly!\n');
    } else {
      console.log('❌ Users list endpoint failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 9: Users by ID endpoint
  console.log('9️⃣ Testing users/:id endpoint:');
  try {
    const response = await fetch(`${API_BASE}/users/42`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.payload?.id === '42') {
      console.log('✅ Users by ID endpoint works correctly!\n');
    } else {
      console.log('❌ Users by ID endpoint failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 10: Health endpoint
  console.log('🔟 Testing health endpoint:');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.payload?.healthy === true) {
      console.log('✅ Health endpoint works correctly!\n');
    } else {
      console.log('❌ Health endpoint failed!\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('🎉 All tests completed!');
}

// Run the tests
testApi().catch(console.error);