import { baseLayout } from '../base-layout'

// ─── 1. Welcome — Early Access Request ─────────────────────────────────────
// Sent when someone submits email on landing page

export function welcomeEarlyAccessEmail({ email }: { email: string }): { subject: string; html: string } {
  const subject = "You're on the list — Cytron Early Access"

  const content = `
    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:32px; font-weight:700; line-height:1.2; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.03em;">
      You're in. <span style="color:#886cff;">Welcome.</span>
    </h1>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Hey there,
    </p>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Thanks for requesting early access to <strong style="color:#ffffff;">Cytron</strong> &mdash; the easiest way to distribute your videos to every social platform, simultaneously.
    </p>

    <div style="margin:32px 0; padding:24px; background:rgba(136,108,255,0.03); border:1px solid rgba(136,108,255,0.15); border-radius:12px;">
      <p style="margin:0 0 16px 0; color:#886cff; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; font-family:'SF Mono',Menlo,monospace;">What you'll get access to</p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:6px 0; color:#d0d0d0; font-size:13px; font-family:'SF Mono',Menlo,monospace;">&nbsp;&nbsp;<span style="color:#886cff;">&#10003;</span>&nbsp;&nbsp;AI creates cinematic videos from your photos</td></tr>
        <tr><td style="padding:6px 0; color:#d0d0d0; font-size:13px; font-family:'SF Mono',Menlo,monospace;">&nbsp;&nbsp;<span style="color:#886cff;">&#10003;</span>&nbsp;&nbsp;Record from camera &amp; post instantly</td></tr>
        <tr><td style="padding:6px 0; color:#d0d0d0; font-size:13px; font-family:'SF Mono',Menlo,monospace;">&nbsp;&nbsp;<span style="color:#886cff;">&#10003;</span>&nbsp;&nbsp;Upload ready-made videos</td></tr>
        <tr><td style="padding:6px 0; color:#d0d0d0; font-size:13px; font-family:'SF Mono',Menlo,monospace;">&nbsp;&nbsp;<span style="color:#886cff;">&#10003;</span>&nbsp;&nbsp;Auto-publish to Instagram, TikTok, Facebook, LinkedIn</td></tr>
        <tr><td style="padding:6px 0; color:#d0d0d0; font-size:13px; font-family:'SF Mono',Menlo,monospace;">&nbsp;&nbsp;<span style="color:#886cff;">&#10003;</span>&nbsp;&nbsp;Choose: AI-enhance or post raw &mdash; you decide</td></tr>
      </table>
    </div>

    <p style="margin:0 0 16px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      <strong style="color:#ffffff;">What's next?</strong>
    </p>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      We're onboarding users in batches to ensure everyone gets a great experience. You'll receive your access credentials within <strong style="color:#886cff;">24-48 hours</strong>.
    </p>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      In the meantime, check out what Cytron can do:
    </p>
  `

  return {
    subject,
    html: baseLayout({
      title: subject,
      preheader: "You're in. Your Cytron early access request was received.",
      content,
      ctaUrl: 'https://cytronai.com',
      ctaText: 'Explore Cytron',
      footerNote: `If you didn't request access, you can safely ignore this email. Questions? Just reply to this email &mdash; a human will get back to you.`,
    }),
  }
}
