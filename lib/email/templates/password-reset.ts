import { baseLayout } from '../base-layout'

// ─── 4. Password Reset ─────────────────────────────────────────────────────

export function passwordResetEmail({ resetUrl }: { resetUrl: string }): { subject: string; html: string } {
  const subject = "Reset your Cytron password"

  const content = `
    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:32px; font-weight:700; line-height:1.2; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.03em;">
      Reset your <span style="color:#886cff;">password.</span>
    </h1>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      We received a request to reset the password for your Cytron account.
    </p>

    <p style="margin:0 0 24px 0; color:#a0a0a0; font-size:15px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
      Click the button below to choose a new password. This link will expire in <strong style="color:#ffffff;">1 hour</strong>.
    </p>

    <div style="margin:32px 0; padding:20px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
      <p style="margin:0 0 8px 0; color:#666; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; font-family:'SF Mono',Menlo,monospace;">⚠ Security note</p>
      <p style="margin:0; color:#a0a0a0; font-size:13px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
        If you didn't request this, you can safely ignore this email. Your password won't change unless you click the link and create a new one.
      </p>
    </div>
  `

  return {
    subject,
    html: baseLayout({
      title: subject,
      preheader: 'Reset your Cytron password. Link expires in 1 hour.',
      content,
      ctaUrl: resetUrl,
      ctaText: 'Reset Password',
      footerNote: `If the button doesn't work, copy this URL: ${resetUrl}`,
    }),
  }
}
