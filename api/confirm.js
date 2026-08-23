/* Vercel serverless function — sends a confirmation email via Resend.
   The Resend API key stays server-side (process.env.RESEND_API_KEY). */
function buildHtml(name) {
  const first = name && name.trim() ? name.trim().split(" ")[0] : "there";
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:32px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:10px;padding:40px 36px;">
    <p style="margin:0 0 22px;color:#F05138;font-weight:700;letter-spacing:.6px;font-size:12px;text-transform:uppercase;">Swift Student Challenge 2027 · Parul University</p>
    <h1 style="margin:0 0 14px;color:#111418;font-size:22px;line-height:1.3;font-weight:700;">Your response has been recorded</h1>
    <p style="margin:0 0 16px;color:#3f4651;font-size:15px;line-height:1.65;">
      Hi ${first}, thank you for registering for the Swift Student Challenge 2027. Your response has been recorded and our team at <strong style="color:#111418;">AATC, Parul University</strong> is now reviewing it. You'll hear back from us soon with the next steps — no action is needed from your side right now.
    </p>
    <p style="margin:0;color:#3f4651;font-size:15px;line-height:1.65;">
      If you have any questions, just reply to this email or write to us at <a href="mailto:me@subhansh.dev" style="color:#F05138;text-decoration:none;">me@subhansh.dev</a>.
    </p>
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid #eceef1;color:#9aa1ab;font-size:12px;">
      AATC · Parul University — Swift Student Challenge 2027
    </div>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const body = req.body || {};
  const email = body.email;
  const name = body.name || "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "valid email required" });
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "RESEND_API_KEY not configured" });
    return;
  }
  const html = buildHtml(name);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "AATC Parul University <onboarding@resend.dev>",
        to: [email],
        subject: "Application Recorded — AATC Parul University · Swift Student Challenge 2027",
        html: html
      })
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }
    if (!r.ok) {
      res.status(r.status).json({ resendStatus: r.status, resend: data });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
