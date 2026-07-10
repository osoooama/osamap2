import { Resend } from 'resend';

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY!);
}

function verificationTemplate(username: string, code: string): string {
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Tahoma,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4)">
<tr><td align="center" style="padding:30px 30px 0">
<img src="https://ui-avatars.com/api/?name=Osama+Kreishan&background=6366f1&color=fff&size=80&bold=true" width="80" height="80" style="border-radius:50%;border:3px solid #6366f1" alt="Osama Kreishan"/>
<h1 style="color:#fff;font-size:22px;margin:15px 0 5px">OSAMA/>Dev</h1>
<p style="color:#94a3b8;font-size:13px;margin:0">منصة البث المتكاملة</p>
</td></tr>
<tr><td style="padding:25px 30px">
<p style="color:#e2e8f0;font-size:15px;line-height:1.7">مرحباً <strong style="color:#6366f1">${username}</strong>،</p>
<p style="color:#cbd5e1;font-size:14px;line-height:1.7">شكراً لتسجيلك في <strong>OSAMA/>Dev</strong>.<br/>رمز التحقق الخاص بك هو:</p>
<div style="background:#0f0f1f;border-radius:12px;padding:20px;margin:15px 0;text-align:center;border:1px solid #6366f1">
<span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#6366f1;font-family:monospace">${code}</span>
</div>
<p style="color:#94a3b8;font-size:12px">صلاحية الكود 10 دقائق فقط. إذا لم تقم بالتسجيل، تجاهل هذه الرسالة.</p>
</td></tr>
<tr><td style="background:#12122a;padding:20px 30px;text-align:center">
<p style="color:#94a3b8;font-size:12px;margin:0 0 12px">المطور: أسامة كريشان</p>
<div style="display:inline-block;margin:0 8px">
<a href="https://instagram.com/osoo_ama" style="color:#6366f1;font-size:13px;text-decoration:none">Instagram</a>
</div>
<div style="display:inline-block;margin:0 8px">
<a href="https://wa.me/962795053016" style="color:#6366f1;font-size:13px;text-decoration:none">WhatsApp</a>
</div>
<div style="display:inline-block;margin:0 8px">
<a href="mailto:osamakreshan49@gmail.com" style="color:#6366f1;font-size:13px;text-decoration:none">Email</a>
</div>
<p style="color:#4a5568;font-size:11px;margin:15px 0 0">© ${new Date().getFullYear()} OSAMA/>Dev. جميع الحقوق محفوظة.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function verificationText(username: string, code: string): string {
  return `مرحباً ${username}،

شكراً لتسجيلك في OSAMA/>Dev.

رمز التحقق الخاص بك هو: ${code}

صلاحية الكود 10 دقائق فقط.
إذا لم تقم بالتسجيل، تجاهل هذه الرسالة.

- أسامة كريشان (Osama Kreishan)
Instagram: @osoo_ama
WhatsApp: +962795053016
Email: osamakreshan49@gmail.com`;
}

export async function sendVerificationEmail(to: string, username: string, code: string) {
  await getResend().emails.send({
    from: 'OSAMA/>Dev <onboarding@resend.dev>',
    to,
    subject: '🔑 رمز التحقق الخاص بـ OSAMA/>Dev',
    html: verificationTemplate(username, code),
    text: verificationText(username, code),
  });
}
