export async function fetchProperties() {
  const res = await fetch('/api/properties', {
    headers: {
      'X-Trore-Auth': 'v1-alpha'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
