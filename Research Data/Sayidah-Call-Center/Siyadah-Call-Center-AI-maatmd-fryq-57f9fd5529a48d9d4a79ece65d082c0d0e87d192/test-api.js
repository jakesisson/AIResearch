// Quick API test
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing /api/settings...');
    const response = await fetch('http://localhost:5000/api/settings');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
      console.log('Type:', typeof json);
      console.log('Keys:', Object.keys(json));
    } catch (e) {
      console.log('JSON parse error:', e.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();