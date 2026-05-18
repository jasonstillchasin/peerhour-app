import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return res.status(500).json({ error: 'Database not configured.' });
    }

    const { lectureId, email, join } = req.body ?? {};
    if (!lectureId || !email) return res.status(400).json({ error: 'Missing lectureId or email.' });

    const kv = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    const userKey = `rsvp:user:${email}:${lectureId}`;
    const countKey = `rsvp:count:${lectureId}`;

    if (join) {
      const wasNew = await kv.setnx(userKey, 1);
      const count = wasNew ? await kv.incr(countKey) : (Number(await kv.get(countKey)) || 0);
      return res.status(200).json({ count, joined: true });
    } else {
      const removed = await kv.del(userKey);
      let count = removed ? await kv.decr(countKey) : (Number(await kv.get(countKey)) || 0);
      if (count < 0) { await kv.set(countKey, 0); count = 0; }
      return res.status(200).json({ count, joined: false });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
