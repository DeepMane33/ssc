/* Vercel serverless function — sends a confirmation email via Resend.
   The Resend API key stays server-side (process.env.RESEND_API_KEY). */
const assets = require("./assets");

function buildHtml(name, parulB64, swiftB64) {
  const first = name && name.trim() ? name.trim().split(" ")[0] : "there";
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0a0c12;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:linear-gradient(155deg,rgba(20,24,34,0.92),rgba(11,13,20,0.96));border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:22px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <img src="data:image/jpeg;base64,${parulB64}" height="38" alt="Parul University" style="display:block;">
      <span style="color:#F05138;font-weight:700;letter-spacing:.6px;font-size:12px;">SWIFT STUDENT CHALLENGE 2027</span>
    </div>
    <div style="padding:34px 30px;">
      <img src="data:image/png;base64,${swiftB64}" height="54" alt="Swift" style="display:block;margin-bottom:22px;">
      <h1 style="color:#ffffff;font-size:22px;line-height:1.3;margin:0 0 12px;font-weight:700;">Your response has been recorded, ${first}</h1>
      <p style="color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65;margin:0 0 18px;">
        Hi ${first}, thank you for applying to the Swift Student Challenge 2027. Your response has been successfully recorded by our team at <strong style="color:#fff;">AATC, Parul University</strong> and is now under review.
      </p>
      <div style="background:rgba(240,81,56,0.08);border:1px solid rgba(240,81,56,0.25);border-radius:12px;padding:14px 16px;color:rgba(255,255,255,0.82);font-size:14px;line-height:1.55;">
        We'll reach out to you via email with the next steps. Keep an eye on your inbox — no further action is needed from your side right now.
      </div>
    </div>
    <div style="padding:18px 30px;border-top:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:12px;">
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
  const html = buildHtml(name, assets.parul, assets.swift);
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
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json(data);
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
