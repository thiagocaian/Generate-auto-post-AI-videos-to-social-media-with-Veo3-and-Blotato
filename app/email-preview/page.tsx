import { welcomeEarlyAccessEmail } from '@/lib/email/templates/welcome-early-access'
import { accessGrantedEmail } from '@/lib/email/templates/access-granted'

export default function EmailPreviewPage({ searchParams }: { searchParams: { template?: string } }) {
  const template = searchParams.template || 'welcome'

  let html = ''
  let subject = ''
  let name = ''

  switch (template) {
    case 'welcome':
      const welcome = welcomeEarlyAccessEmail({ email: 'cliente@example.com' })
      html = welcome.html
      subject = welcome.subject
      name = 'Welcome — Early Access Request'
      break
    case 'access':
      const access = accessGrantedEmail({ email: 'cliente@example.com', loginUrl: 'https://cytronai.com/login' })
      html = access.html
      subject = access.subject
      name = 'Access Granted'
      break
    default:
      html = '<p>Template not found</p>'
      subject = 'N/A'
      name = 'N/A'
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'SF Mono, Menlo, monospace' }}>
      {/* Header Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: '#0a0a0a',
      }}>
        <h1 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>📧 Email Preview</h1>
        <span style={{ color: '#666', fontSize: 12 }}>{name}</span>
        <span style={{ marginLeft: 'auto', color: '#886cff', fontSize: 11 }}>Subject: {subject}</span>
      </div>

      {/* Template Switcher */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: 8,
        background: '#050505',
        flexWrap: 'wrap',
      }}>
        {[
          { key: 'welcome', label: '1. Welcome Early Access' },
          { key: 'access', label: '2. Access Granted' },
        ].map(t => (
          <a
            key={t.key}
            href={`?template=${t.key}`}
            style={{
              padding: '6px 12px',
              fontSize: 11,
              color: template === t.key ? '#000' : '#aaa',
              background: template === t.key ? '#886cff' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Email Render */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
