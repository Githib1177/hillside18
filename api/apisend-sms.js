// api/send-sms.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { to, text } = req.body || {};
    if (!Array.isArray(to) || !to.length || !text) {
      return res.status(400).json({ error: 'Missing "to" or "text"' });
    }

    const SMS_UPSTREAM_URL = process.env.SMS_UPSTREAM_URL; // stejný endpoint jako u Link Builderu

    const headers = { 'Content-Type': 'application/json' };
    if (process.env.SMS_AUTH_BEARER) headers['Authorization'] = `Bearer ${process.env.SMS_AUTH_BEARER}`;
    if (process.env.SMS_API_KEY)     headers['x-api-key']     = process.env.SMS_API_KEY;

    const r = await fetch(SMS_UPSTREAM_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, text: String(text).slice(0, 1000) })
    });

    const raw = await r.text();
    let data; try { data = JSON.parse(raw); } catch { data = { raw }; }

    if (!r.ok) return res.status(r.status).json({ error: 'Upstream error', data });
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
