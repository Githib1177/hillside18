// api/send-sms.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, text } = req.body || {};
    if (!Array.isArray(to) || to.length === 0 || !text) {
      return res.status(400).json({ error: 'Missing "to" or "text"' });
    }

    // mapa na SMS podle dokumentace
    const login = process.env.SMS_LOGIN;       // váš login
    const password = process.env.SMS_PASSWORD; // heslo
    const baseUrl = 'https://api.smsbrana.cz/smsconnect/http.php';

    const results = [];

    for (const recipient of to) {
      // normalizuj číslo, zjisti, jestli je mezinárodní + začíná +, nebo přidej +420 pokud není

      const resp = await fetch(
        `${baseUrl}?login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}&action=send_sms&number=${encodeURIComponent(recipient)}&message=${encodeURIComponent(text)}`,
        {
          method: 'GET'  // nebo POST, pokud chcete
        }
      );
      const body = await resp.text();
      results.push({
        to: recipient,
        status: resp.ok,
        response: body
      });
    }

    // vrátíme souhrn
    return res.status(200).json({ ok: true, results });

  } catch (err) {
    console.error('send-sms error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
