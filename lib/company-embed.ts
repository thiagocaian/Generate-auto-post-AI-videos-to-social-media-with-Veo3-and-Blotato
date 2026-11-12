export type CompanyEmbed = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  plan?: string | null;
  plan_status?: string | null;
  primary_color?: string | null;
  logo_url?: string | null;
  trial_ends_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

/** PostgREST returns a to-one embed as an object and a to-many embed as an array. */
export function unwrapCompany(value: unknown): CompanyEmbed | null {
  const row = Array.isArray(value) ? value.find((item) => item && typeof item === "object") : value;
  if (!row || typeof row !== "object") return null;
  return row as CompanyEmbed;
}
