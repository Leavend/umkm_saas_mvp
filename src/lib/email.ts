// Email service using Resend API directly via fetch
import { logger } from "./logger";
import { captureError } from "./sentry";

interface EmailResponse {
  id?: string;
  error?: { message: string };
}

// Send daily credit notification email
export async function sendDailyCreditEmail(
  to: string,
  name: string,
  credits: number,
) {
  try {
    const html = generateEmailTemplate(name, credits);
    const data = await callResendApi(
      to,
      "Your Daily Credits Are Here! 🎁",
      html,
    );

    logger.info({ msg: "Email sent", to, emailId: data.id });
    return { success: true, id: data.id };
  } catch (error) {
    logger.error({ msg: "Email send failed", to, err: error });
    captureError(error, { tags: { service: "email" }, extra: { to } });
    return { success: false, error };
  }
}

async function callResendApi(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AI Image Editor <noreply@yourdomain.com>",
      to: [to],
      subject,
      html,
    }),
  });

  const data: EmailResponse = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message);
  return data;
}

// Generate HTML email template
function generateEmailTemplate(name: string, credits: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Credits</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;text-align:center;border-radius:12px 12px 0 0">
      <h1 style="color:white;margin:0;font-size:28px">🎁 Daily Credits!</h1>
    </div>
    <div style="padding:40px 20px">
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hi ${name || "there"},
      </p>
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px">
        Your daily credits are ready! You now have <strong style="color:#667eea">${credits} credits</strong> to create amazing AI-generated images.
      </p>
      <div style="text-align:center;margin:30px 0">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
           style="background:#667eea;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;display:inline-block">
          Start Creating →
        </a>
      </div>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:20px 0 0">
        Happy creating! 🎨
      </p>
    </div>
    <div style="background:#f9f9f9;padding:20px;text-align:center;border-radius:0 0 12px 12px">
      <p style="color:#999;font-size:12px;margin:0">
        © ${new Date().getFullYear()} AI Image Editor. All rights reserved.
      </p>
      <p style="color:#999;font-size:12px;margin:8px 0 0">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#999;text-decoration:underline">
          Unsubscribe
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
