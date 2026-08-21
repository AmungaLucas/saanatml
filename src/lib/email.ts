import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.sanaathrumylens.co.ke',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'info@sanaathrumylens.co.ke',
    pass: process.env.SMTP_PASS || '',
  },
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: `"Sanaa Through My Lens" <${process.env.SMTP_USER || 'info@sanaathrumylens.co.ke'}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Failed to send email:', err)
    return false
  }
}

function credentialsHtml(name: string, email: string, password: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sanaathrumylens.co.ke'
  // Build HTML without <div> at statement start to avoid TS parse confusion
  return [
    '<div style="max-width:480px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a">',
    '  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #e5e5e5">',
    '    <h1 style="font-size:22px;font-weight:700;margin:0;color:#111">Sanaa Through My Lens</h1>',
    '    <p style="font-size:13px;color:#666;margin:4px 0 0">Art Through My Lens</p>',
    '  </div>',
    '  <div style="padding:32px 24px">',
    '    <p style="font-size:16px;margin:0 0 8px">Hello <strong>' + name + '</strong>,</p>',
    '    <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 20px">',
    '      An administrator has created a CMS account for you. You can now log in to manage your articles.',
    '    </p>',
    '    <div style="background:#f7f7f7;border-radius:8px;padding:20px;margin-bottom:24px">',
    '      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#888;margin:0 0 8px">Your Login Credentials</p>',
    '      <p style="margin:0 0 6px"><strong>Email:</strong> ' + email + '</p>',
    '      <p style="margin:0 0 6px"><strong>Password:</strong> <code style="background:#e8e8e8;padding:2px 8px;border-radius:4px;font-size:14px">' + password + '</code></p>',
    '    </div>',
    '    <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 20px">',
    '      When you first log in, a verification code will be sent to this email for two-factor authentication.',
    '    </p>',
    '    <a href="' + siteUrl + '/login"',
    '       style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500">',
    '      Go to Login',
    '    </a>',
    '  </div>',
    '  <div style="border-top:1px solid #e5e5e5;padding:16px 24px;text-align:center;font-size:11px;color:#999">',
    '    Sanaa Through My Lens &middot; sanaathrumylens.co.ke',
    '  </div>',
    '</div>',
  ].join('\n')
}

export async function sendCredentialsEmail({ to, name, email, password }: { to: string; name: string; email: string; password: string }) {
  return sendEmail({
    to,
    subject: 'Your Sanaa CMS Account is Ready',
    html: credentialsHtml(name, email, password),
  })
}

function twoFaHtml(code: string): string {
  return [
    '<div style="max-width:480px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a">',
    '  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #e5e5e5">',
    '    <h1 style="font-size:22px;font-weight:700;margin:0;color:#111">Sanaa Through My Lens</h1>',
    '    <p style="font-size:13px;color:#666;margin:4px 0 0">Art Through My Lens</p>',
    '  </div>',
    '  <div style="padding:32px 24px;text-align:center">',
    '    <p style="font-size:16px;margin:0 0 8px">Your verification code is:</p>',
    '    <div style="background:#f7f7f7;border-radius:12px;padding:24px;margin:16px 0 24px">',
    '      <span style="font-size:36px;font-weight:700;letter-spacing:8px;font-family:monospace;color:#111">' + code + '</span>',
    '    </div>',
    '    <p style="font-size:13px;color:#666;line-height:1.5;margin:0">',
    '      This code expires in <strong>5 minutes</strong>. Do not share it with anyone.',
    '    </p>',
    '  </div>',
    '  <div style="border-top:1px solid #e5e5e5;padding:16px 24px;text-align:center;font-size:11px;color:#999">',
    '    Sanaa Through My Lens &middot; sanaathrumylens.co.ke',
    '  </div>',
    '</div>',
  ].join('\n')
}

export async function send2FACode({ to, code }: { to: string; code: string }) {
  return sendEmail({
    to,
    subject: 'Your Sanaa Login Code: ' + code,
    html: twoFaHtml(code),
  })
}
