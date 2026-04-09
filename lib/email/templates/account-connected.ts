import { baseLayout } from '../base-layout'

// ─── 5. Account Connected ──────────────────────────────────────────────────

export function accountConnectedEmail({ platform, username, dashboardUrl }: { platform: string; username: string; dashboardUrl: string }): { subject: string; html: string } {
  const subject = `✓ ${platform} connected to Cytron`

  const platformEmoji: Record<string, string> = {
    instagram: '📸',
    tiktok: '🎵',
    facebook: '📘',
    linkedin: '💼',
    youtube: '▶️',
    twitter: '🐦',
  }

  const emoji = platformEmoji[platform.toLowerCase()] || '✓'

  const content = `
    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:32px; font-weight:700; line-height:1.2; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.03em;">
      ${platform} <span style="color:#886cff;">connected.</span>
    </h1>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Your <strong style="color:#ffffff;">${platform}</strong> account is now linked to Cytron. You can now post videos to ${platform} with one click.
    </p>

    <div style="margin:32px 0; padding:24px; background:rgba(136,108,255,0.03); border:1px solid rgba(136,108,255,0.15); border-radius:12px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:4px 0; color:#886cff; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; font-family:'SF Mono',Menlo,monospace;">Connected account</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#ffffff; font-size:18px; font-weight:600; font-family:'SF Mono',Menlo,monospace;">
            ${emoji} ${username}
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#888; font-size:12px; font-family:'SF Mono',Menlo,monospace;">
            Platform: ${platform} · Status: <span style="color:#886cff;">● Active</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 16px 0; color:#ffffff; font-size:14px; font-weight:600; font-family:'SF Mono',Menlo,monospace;">What's next?</p>
    <p style="margin:0 0 8px 0; color:#a0a0a0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      &bull; Head to the Video Hub to create or upload your first video<br/>
      &bull; Connect more platforms to distribute everywhere at once<br/>
      &bull; Schedule your posts for optimal engagement times
    </p>
  `

  return {
    subject,
    html: baseLayout({
      title: subject,
      preheader: `Your ${platform} account is now connected to Cytron.`,
      content,
      ctaUrl: dashboardUrl,
      ctaText: 'Go to Video Hub',
      footerNote: `If you didn't connect this account, please disconnect it immediately from your Cytron settings.`,
    }),
  }
}
