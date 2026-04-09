// ─── Cytron Email Base Layout ───────────────────────────────────────────────
// Dark theme, lilac accent (#886cff), mobile-friendly
// Used by all email templates

export type EmailLayoutOptions = {
  title: string
  preheader?: string // Preview text shown in inbox
  content: string    // HTML body content
  ctaUrl?: string
  ctaText?: string
  footerNote?: string
}

export function baseLayout({ title, preheader, content, ctaUrl, ctaText, footerNote }: EmailLayoutOptions): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background: #050505; font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace; }
    a { color: #886cff; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px 16px !important; }
      h1 { font-size: 28px !important; line-height: 1.2 !important; }
      .cta { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#050505; color:#e5e5e5;">
  ${preheader ? `<div style="display:none; font-size:1px; color:#050505; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#050505;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width:600px; background:#0a0a0a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; overflow:hidden;">

          <!-- Header: Logo + Brand -->
          <tr>
            <td style="padding:32px 40px 24px 40px; border-bottom:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.15); border-radius:8px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                          <span style="color:#fff; font-size:20px; font-weight:700; font-family:'SF Mono',Menlo,monospace;">C</span>
                        </td>
                        <td style="padding-left:12px; vertical-align:middle;">
                          <span style="color:#ffffff; font-size:16px; font-weight:600; font-family:'SF Mono',Menlo,monospace; letter-spacing:-0.02em;">Cytron</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block; padding:4px 10px; border:1px solid rgba(136,108,255,0.3); background:rgba(136,108,255,0.05); color:#886cff; font-size:10px; font-weight:600; font-family:'SF Mono',Menlo,monospace; letter-spacing:0.1em; text-transform:uppercase; border-radius:999px;">Early Access</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td class="content" style="padding:40px; font-family:'SF Mono',Menlo,Monaco,Consolas,monospace; color:#e5e5e5;">
              ${content}

              ${ctaUrl && ctaText ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td class="cta" style="background:#886cff; border-radius:8px;">
                          <a href="${ctaUrl}" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:14px; font-weight:600; font-family:'SF Mono',Menlo,monospace; text-decoration:none; letter-spacing:0.02em;">${ctaText} &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${footerNote ? `<p style="margin:32px 0 0 0; padding-top:24px; border-top:1px solid rgba(255,255,255,0.06); color:#666666; font-size:12px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">${footerNote}</p>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; background:#050505; border-top:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px 0; color:#666666; font-size:11px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
                      <strong style="color:#999999;">Cytron</strong> &mdash; Video Distribution Engine
                    </p>
                    <p style="margin:0 0 12px 0; color:#555555; font-size:10px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
                      Gold Coast, Queensland, Australia &middot; <a href="https://cytronai.com" style="color:#886cff;">cytronai.com</a>
                    </p>
                    <p style="margin:0; color:#444444; font-size:10px; line-height:1.6; font-family:'SF Mono',Menlo,monospace;">
                      You're receiving this because you requested early access to Cytron.<br/>
                      <a href="{{unsubscribe_url}}" style="color:#666666; text-decoration:underline;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
