async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/overview');
    const data = await response.json();
    console.log("API Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("API Test Failed:", error.message);
  }
}

testApi();
