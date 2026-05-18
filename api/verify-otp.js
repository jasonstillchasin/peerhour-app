import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, code, mode, name, year, house } = req.body ?? {};
  if (!email || !code || !mode) return res.status(400).json({ error: 'Missing fields.' });

  const norm = email.trim().toLowerCase();

  const stored = await kv.get(`otp:${norm}`);
  if (!stored) return res.status(400).json({ error: 'Code expired or not found. Request a new one.' });
  if (stored !== code.trim()) return res.status(400).json({ error: 'Wrong code. Try again.' });

  await kv.del(`otp:${norm}`);

  let user;
  if (mode === 'login') {
    user = await kv.get(`user:${norm}`);
    if (!user) return res.status(400).json({ error: 'Account not found.' });
  } else {
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    user = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: norm,
      role: 'student',
      initials,
      avatarColor: 'avatar-c1',
      subjects: [],
      sessionsCount: 0,
      rating: null,
      year: Number(year),
      house,
    };
    await kv.set(`user:${norm}`, user);
  }

  return res.status(200).json({ user });
}
