import React from 'react'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light' | 'icon-only'
  className?: string
}

export function LogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 52 : 40
  const id = `grad-${size}`

  return (
    <svg width={dim} height={dim} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {/* Rounded square base */}
      <rect width="40" height="40" rx="10" fill={`url(#${id})`} />
      {/* Circuit node circles */}
      <circle cx="10" cy="10" r="2" fill="white" fillOpacity="0.3" />
      <circle cx="30" cy="10" r="2" fill="white" fillOpacity="0.3" />
      <circle cx="10" cy="30" r="2" fill="white" fillOpacity="0.3" />
      <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.3" />
      {/* Circuit trace lines */}
      <line x1="10" y1="10" x2="10" y2="16" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
      <line x1="30" y1="10" x2="30" y2="16" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
      <line x1="10" y1="24" x2="10" y2="30" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
      <line x1="30" y1="24" x2="30" y2="30" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
      {/* Central lightning bolt — refined */}
      <path
        d="M22 8L13 21H20L18 32L27 19H20L22 8Z"
        fill="white"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogoWordmark({ variant = 'dark', size = 'md' }: LogoProps) {
  const textColor = variant === 'dark' ? '#F8FAFC' : '#111827'
  const subColor  = variant === 'dark' ? '#64748B' : '#9CA3AF'
  const fontSize  = size === 'sm' ? 13 : size === 'lg' ? 20 : 15

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? 14 : 10 }}>
      <LogoIcon size={size} />
      <div>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 800,
          fontSize,
          letterSpacing: '0.12em',
          color: textColor,
          lineHeight: 1,
        }}>
          CYTRON
        </div>
        {size !== 'sm' && (
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: '0.2em',
            color: subColor,
            marginTop: 2,
            textTransform: 'uppercase' as const,
          }}>
            Platform
          </div>
        )}
      </div>
    </div>
  )
}

export default LogoWordmark
