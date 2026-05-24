// Serverless function: receives the registration form and emails it via Resend.
// Secrets/config come from environment variables set in Vercel (never committed):
//   RESEND_API_KEY  (required)  - Resend API key
//   MAIL_TO         (optional)  - recipient, default kansli@syrianska-rf.se
//   MAIL_FROM       (optional)  - sender, default Resend's shared onboarding address

const MAIL_TO = process.env.MAIL_TO || 'kansli@syrianska-rf.se';
const MAIL_FROM = process.env.MAIL_FROM || 'Syrianska Cupen <onboarding@resend.dev>';

const escapeHtml = value =>
  String(value).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot — silently accept to avoid tipping off bots
  if (body._honey) {
    res.status(200).json({ success: true });
    return;
  }

  const forening = String(body.forening || '').trim();
  const kontakt = String(body.kontakt || '').trim();
  const telefon = String(body.telefon || '').trim();
  const epost = String(body.epost || '').trim();

  if (!forening || !kontakt || !telefon || !epost) {
    res.status(400).json({ success: false, error: 'Alla obligatoriska fält måste fyllas i.' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ success: false, error: 'E-posttjänsten är inte konfigurerad.' });
    return;
  }

  const html = `
    <h2 style="margin:0 0 16px">Ny anmälan – Syrianska Cupen 2026</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold">Förening</td><td style="padding:6px 0">${escapeHtml(forening)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold">Kontaktperson</td><td style="padding:6px 0">${escapeHtml(kontakt)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold">Telefon</td><td style="padding:6px 0">${escapeHtml(telefon)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold">E-post</td><td style="padding:6px 0">${escapeHtml(epost)}</td></tr>
    </table>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        reply_to: epost,
        subject: `Anmälan Syrianska Cupen 2026 – ${forening}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Resend error', response.status, detail);
      res.status(502).json({ success: false, error: 'Kunde inte skicka anmälan just nu.' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send failed', err);
    res.status(500).json({ success: false, error: 'Internt fel vid utskick.' });
  }
};
