function clean(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Sidebar title: company, then email, then a neutral label. Never "Loading...". */
export function accountLabel(companyName?: string | null, email?: string | null): string {
  return clean(companyName) || clean(email) || "Account";
}

/** Line under the Dashboard heading. */
export function panelSubtitle(companyName?: string | null, email?: string | null): string {
  const name = clean(companyName);
  if (name) return `${name} — Overview`;
  const mail = clean(email);
  if (mail) return `${mail} — Overview`;
  return "Overview";
}
