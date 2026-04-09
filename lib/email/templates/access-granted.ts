import { baseLayout } from '../base-layout'

// ─── 2. Access Granted ─────────────────────────────────────────────────────
// Sent when admin approves a lead — includes login link

export function accessGrantedEmail({ email, loginUrl }: { email: string; loginUrl: string }): { subject: string; html: string } {
  const subject = "🎬 Your Cytron access is ready"

  const content = `
    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:32px; font-weight:700; line-height:1.2; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.03em;">
      Your access is <span style="color:#886cff;">ready.</span>
    </h1>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Great news &mdash; your Cytron account is active. You can now start distributing videos to every platform in one click.
    </p>

    <div style="margin:32px 0; padding:24px; background:rgba(136,108,255,0.03); border:1px solid rgba(136,108,255,0.15); border-radius:12px;">
      <p style="margin:0 0 12px 0; color:#886cff; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; font-family:'SF Mono',Menlo,monospace;">Your account</p>
      <p style="margin:0; color:#ffffff; font-size:14px; font-family:'SF Mono',Menlo,monospace;">
        ${email}
      </p>
    </div>

    <p style="margin:0 0 16px 0; color:#ffffff; font-size:15px; font-weight:600; font-family:'SF Mono',Menlo,monospace;">Getting started (3 steps):</p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0; color:#a0a0a0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
          <strong style="color:#886cff;">1.</strong>&nbsp;&nbsp;Click the button below to log in
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#a0a0a0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
          <strong style="color:#886cff;">2.</strong>&nbsp;&nbsp;Connect your social accounts (Instagram, TikTok, etc)
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#a0a0a0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
          <strong style="color:#886cff;">3.</strong>&nbsp;&nbsp;Upload a photo or record a video &mdash; post everywhere
        </td>
      </tr>
    </table>
  `

  return {
    subject,
    html: baseLayout({
      title: subject,
      preheader: 'Your Cytron early access is active. Log in now.',
      content,
      ctaUrl: loginUrl,
      ctaText: 'Log in to Cytron',
      footerNote: `This link is unique to you. For security, do not share it.`,
    }),
  }
}
