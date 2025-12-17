const axios = require('axios');

async function testSchemesAPI() {
    const baseURL = 'http://localhost:5000/api';
    
    try {
        console.log('Testing Government Schemes API...\n');
        
        // Test 1: Get all schemes
        console.log('1. Testing GET /api/schemes...');
        try {
            const response = await axios.get(`${baseURL}/schemes`, {
                headers: {
                    'Authorization': 'Bearer test-token' // You'll need a real token
                }
            });
            console.log('✅ Success:', response.data.total, 'schemes found');
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.error || error.message);
        }
        
        // Test 2: Get available states
        console.log('\n2. Testing GET /api/schemes/states...');
        try {
            const response = await axios.get(`${baseURL}/schemes/states`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Success:', response.data.data.length, 'states found');
            console.log('States:', response.data.data.slice(0, 5).join(', '), '...');
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.error || error.message);
        }
        
        // Test 3: Get statistics
        console.log('\n3. Testing GET /api/schemes/stats...');
        try {
            const response = await axios.get(`${baseURL}/schemes/stats`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Success:', response.data.data);
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.error || error.message);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testSchemesAPI();






