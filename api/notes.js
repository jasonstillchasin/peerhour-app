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

    // Notes are shared — all tutors can see all notes about a student
    if (req.method === 'GET') {
      const { studentEmail } = req.query ?? {};
      if (!studentEmail) return res.status(400).json({ error: 'Missing studentEmail.' });
      if (!isAllowedEmail(studentEmail)) return res.status(403).json({ error: 'Forbidden.' });

      const raw = await kv.hgetall(`student:notes:${studentEmail.toLowerCase()}`);
      return res.status(200).json({ notes: raw ?? {} });
    }

    if (req.method === 'POST') {
      const { tutorId, tutorName, studentEmail, note } = req.body ?? {};
      if (!tutorId || !studentEmail) return res.status(400).json({ error: 'Missing tutorId or studentEmail.' });
      if (!isAllowedEmail(studentEmail)) return res.status(403).json({ error: 'Forbidden.' });

      const entry = { note: note ?? '', tutorName: tutorName ?? tutorId, updatedAt: new Date().toISOString() };
      await kv.hset(`student:notes:${studentEmail.toLowerCase()}`, { [tutorId]: entry });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
