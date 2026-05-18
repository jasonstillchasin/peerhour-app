import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

const ALLOWED_DOMAIN = '@reddamnorthshore.nsw.edu.au';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, mode } = req.body ?? {};
    if (!email || !mode) return res.status(400).json({ error: 'Missing email or mode.' });

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({ error: 'Database not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel → Settings → Environment Variables.' });
    }
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email not configured. Add RESEND_API_KEY in Vercel → Settings → Environment Variables.' });
    }

    const norm = email.trim().toLowerCase();
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    if (mode === 'signup') {
      if (!norm.endsWith(ALLOWED_DOMAIN)) {
        return res.status(400).json({ error: `Only ${ALLOWED_DOMAIN} emails can sign up.` });
      }
      const existing = await kv.get(`user:${norm}`);
      if (existing) return res.status(400).json({ error: 'Account already exists. Sign in instead.' });
    } else {
      const existing = await kv.get(`user:${norm}`);
      if (!existing) return res.status(400).json({ error: 'No account found for that email. Sign up instead.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await kv.set(`otp:${norm}`, code, { ex: 600 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const { error: sendError } = await resend.emails.send({
      from,
      to: norm,
      subject: 'Your peerhour sign-in code',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
          <div style="font-size:22px;font-weight:700;margin-bottom:8px">peerhour</div>
          <p style="color:#555;margin-bottom:24px">Your one-time sign-in code:</p>
          <div style="font-size:40px;font-weight:700;letter-spacing:0.18em;text-align:center;
                      padding:20px;background:#f5f5f5;border-radius:10px;margin-bottom:24px">
            ${code}
          </div>
          <p style="color:#888;font-size:13px">Expires in 10 minutes.</p>
        </div>
      `,
    });

    if (sendError) return res.status(500).json({ error: `Email failed: ${sendError.message}` });
    return res.status(200).json({ sent: true });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
