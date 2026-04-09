import { baseLayout } from '../base-layout'

// ─── 3. Welcome to Cytron ──────────────────────────────────────────────────
// Sent on first successful login

export function welcomeCytronEmail({ name, dashboardUrl }: { name: string; dashboardUrl: string }): { subject: string; html: string } {
  const subject = "Welcome to Cytron — Let's create your first video"

  const content = `
    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:32px; font-weight:700; line-height:1.2; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.03em;">
      Hey ${name}, <span style="color:#886cff;">you're in.</span>
    </h1>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Welcome to Cytron. From now on, distributing videos to every social platform takes one click.
    </p>

    <div style="margin:32px 0; padding:24px; background:rgba(136,108,255,0.03); border:1px solid rgba(136,108,255,0.15); border-radius:12px;">
      <p style="margin:0 0 16px 0; color:#886cff; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; font-family:'SF Mono',Menlo,monospace;">3 steps to your first post</p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:10px 0; color:#d0d0d0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
            <strong style="color:#886cff; font-size:16px;">1.</strong>&nbsp;&nbsp;<strong style="color:#ffffff;">Connect your accounts</strong><br/>
            <span style="color:#888; margin-left:22px;">Instagram, TikTok, Facebook, LinkedIn</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0; color:#d0d0d0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
            <strong style="color:#886cff; font-size:16px;">2.</strong>&nbsp;&nbsp;<strong style="color:#ffffff;">Choose your input</strong><br/>
            <span style="color:#888; margin-left:22px;">AI Create, Record from camera, or Upload video</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0; color:#d0d0d0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
            <strong style="color:#886cff; font-size:16px;">3.</strong>&nbsp;&nbsp;<strong style="color:#ffffff;">Publish everywhere</strong><br/>
            <span style="color:#888; margin-left:22px;">One click = all platforms live</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 16px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Need help? Just reply to this email &mdash; a real human (me!) will respond within a few hours.
    </p>
  `

  return {
    subject,
    html: baseLayout({
      title: subject,
      preheader: `Welcome ${name}! Let's get your first video published.`,
      content,
      ctaUrl: dashboardUrl,
      ctaText: 'Go to Dashboard',
      footerNote: `Cheers,<br/>Thiago &mdash; Cytron Founder`,
    }),
  }
}
