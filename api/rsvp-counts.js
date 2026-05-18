import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return res.status(500).json({ error: 'Database not configured.' });
    }

    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.status(200).json({});

    const kv = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    const keys = ids.map(id => `rsvp:count:${id}`);
    const values = await kv.mget(...keys);

    const result = {};
    ids.forEach((id, i) => { result[id] = Number(values[i] ?? 0); });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
