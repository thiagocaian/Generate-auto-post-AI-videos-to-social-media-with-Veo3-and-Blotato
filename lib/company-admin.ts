/** Company admin login and public contact address. */
export const COMPANY_ADMIN_EMAIL = 'admin@cytroncorporation.com'

export const COMPANY_ADMIN_EMAILS = [COMPANY_ADMIN_EMAIL]

/** Hard-coded company admin plus the ADMIN_EMAILS CSV. Read on each call. */
export function allowedAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  return Array.from(new Set([...COMPANY_ADMIN_EMAILS.map(email => email.toLowerCase()), ...fromEnv]))
}

export function isCompanyAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return allowedAdminEmails().includes(email.toLowerCase())
}

/** 401 when there is no email, 403 when it is outside the admin list, 200 when allowed. */
export function adminEmailStatus(email: string | null | undefined): 401 | 403 | 200 {
  if (!email) return 401
  return isCompanyAdminEmail(email) ? 200 : 403
}
