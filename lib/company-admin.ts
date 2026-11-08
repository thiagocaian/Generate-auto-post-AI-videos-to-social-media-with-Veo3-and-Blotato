/** Company admin login and public contact address. */
export const COMPANY_ADMIN_EMAIL = 'admin@cytroncorporation.com'

export const COMPANY_ADMIN_EMAILS = [COMPANY_ADMIN_EMAIL]

export function isCompanyAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return COMPANY_ADMIN_EMAILS.includes(email.toLowerCase())
}
