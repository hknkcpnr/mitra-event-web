async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/gallery');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response content type:', res.headers.get('content-type'));
    try {
      const data = JSON.parse(text);
      console.log('Images count:', data.images?.length);
    } catch {
      console.log('Response is not JSON. First 100 chars:', text.substring(0, 100));
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

testApi();
