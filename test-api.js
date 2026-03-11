
const url = 'https://h26zt6ri.eu-central.insforge.app/rest/v1/system_stats';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzM4MjR9.KgWUC-issgE4vWelkiAzSfEUGcD9AQM8M7UmOTuFjOI';

async function testFetch() {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetch();
