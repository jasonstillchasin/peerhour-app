import { Redis } from '@upstash/redis';

const ALLOWED_DOMAIN = 'rhns.nsw.edu.au';
const TEST_EMAILS = ['lij62766@gmail.com'];

function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  return e.endsWith(`@${ALLOWED_DOMAIN}`) || TEST_EMAILS.includes(e);
}

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('Database not configured.');
  }
  return new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const kv = getRedis();

    if (req.method === 'GET') {
      const { userEmail } = req.query ?? {};
      if (!userEmail) return res.status(400).json({ error: 'Missing userEmail.' });
      if (!isAllowedEmail(userEmail)) return res.status(403).json({ error: 'Forbidden.' });

      const norm = userEmail.trim().toLowerCase();
      const raw = await kv.hgetall(`student:bookings:${norm}`);
      const bookings = raw ? Object.values(raw) : [];
      return res.status(200).json({ bookings });
    }

    if (req.method === 'POST') {
      const { userEmail, booking } = req.body ?? {};
      if (!userEmail || !booking?.id) return res.status(400).json({ error: 'Missing userEmail or booking.' });
      if (!isAllowedEmail(userEmail)) return res.status(403).json({ error: 'Forbidden.' });

      const norm = userEmail.trim().toLowerCase();
      await kv.hset(`student:bookings:${norm}`, { [booking.id]: booking });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { userEmail, bookingId } = req.query ?? {};
      if (!userEmail || !bookingId) return res.status(400).json({ error: 'Missing userEmail or bookingId.' });
      if (!isAllowedEmail(userEmail)) return res.status(403).json({ error: 'Forbidden.' });

      const norm = userEmail.trim().toLowerCase();
      await kv.hdel(`student:bookings:${norm}`, bookingId);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
