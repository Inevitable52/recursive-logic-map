export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Missing key or value' });
  }

  // For now we’ll just log it to Vercel’s console
  console.log(`Saving definition: ${key} = ${value}`);

  // In a real app you’d store this in a database or file
  return res.status(200).json({ message: 'Definition saved successfully.' });
}
