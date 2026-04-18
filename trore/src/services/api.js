export async function fetchProperties() {
  const response = await fetch('/api/properties', {
    headers: {
      'X-Trore-Auth': 'v1-alpha'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}
