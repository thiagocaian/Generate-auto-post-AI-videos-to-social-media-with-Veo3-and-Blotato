import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — CYTRON",
  description:
    "Privacy Policy for CYTRON, the AI-powered field service management platform by Cytron Pty Ltd.",
};

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        minHeight: "100vh",
        padding: "48px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 40,
            color: "#6b7280",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          &larr; Back to Home
        </Link>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 48 }}>
          Last updated: 15 April 2026
        </p>

        {/* ───────────────────────────────────────────── */}
        <Section title="1. Introduction">
          <p>
            Cytron Pty Ltd (ABN pending) (&quot;Company&quot;, &quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;) operates the CYTRON platform and
            website at{" "}
            <a href="https://cytronai.com" style={linkStyle}>
              cytronai.com
            </a>{" "}
            (&quot;Platform&quot;, &quot;Service&quot;). This Privacy Policy
            explains how we collect, use, disclose, and protect your personal
            information when you use our Service.
          </p>
          <p>
            We are committed to protecting your privacy in accordance with the
            Australian Privacy Act 1988 (Cth) and the Australian Privacy
            Principles (APPs). Where applicable, we also comply with the European
            Union General Data Protection Regulation (GDPR).
          </p>
          <p>
            By using the Platform, you consent to the practices described in this
            Privacy Policy. If you do not agree, please do not use the Service.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 style={subheadingStyle}>2.1 Information You Provide</h3>
          <p>When you register, subscribe, or use the Platform, we may collect:</p>
          <ul style={listStyle}>
            <li>Full name and contact details (email address, phone number)</li>
            <li>Business name, ABN, and business address</li>
            <li>Trade type and industry information</li>
            <li>
              Billing information (processed securely via Stripe; we do not store
              full credit card numbers)
            </li>
            <li>
              Content you upload, including photos, videos, job details, quotes,
              and invoices
            </li>
            <li>Social media account connection details</li>
            <li>Communications with us (support emails, feedback)</li>
          </ul>

          <h3 style={subheadingStyle}>2.2 Information Collected Automatically</h3>
          <p>When you access the Platform, we automatically collect:</p>
          <ul style={listStyle}>
            <li>
              Device information (browser type, operating system, device
              identifiers)
            </li>
            <li>IP address and approximate geolocation</li>
            <li>
              Usage data (pages viewed, features used, timestamps, session
              duration)
            </li>
            <li>Referral source and marketing attribution data</li>
          </ul>

          <h3 style={subheadingStyle}>2.3 Information from Third Parties</h3>
          <p>
            We may receive information from third-party services you connect to the
            Platform, such as social media accounts for content publishing.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your personal information to:</p>
          <ul style={listStyle}>
            <li>Provide, operate, and maintain the Platform</li>
            <li>Process subscriptions, payments, and billing</li>
            <li>
              Generate AI-powered content (videos, suggestions) based on your
              inputs
            </li>
            <li>
              Publish content to connected social media accounts on your behalf
            </li>
            <li>Provide materials price comparison results</li>
            <li>Send transactional communications (invoices, receipts, alerts)</li>
            <li>
              Send marketing communications (with your consent; you may
              unsubscribe at any time)
            </li>
            <li>Improve and develop new features for the Platform</li>
            <li>
              Monitor and analyse usage trends and performance metrics
            </li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Cookies and Tracking Technologies">
          <p>We use cookies and similar technologies to:</p>
          <ul style={listStyle}>
            <li>
              <strong>Essential cookies:</strong> Maintain your session and
              authenticate your identity
            </li>
            <li>
              <strong>Analytics cookies:</strong> Understand how users interact
              with the Platform (via Vercel Analytics)
            </li>
            <li>
              <strong>Preference cookies:</strong> Remember your settings and
              preferences
            </li>
          </ul>
          <p>
            You can manage cookie preferences through your browser settings. Note
            that disabling essential cookies may impair your ability to use the
            Service.
          </p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            We share your information with the following third-party service
            providers, strictly for the purpose of operating the Platform:
          </p>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Provider</th>
                <th style={thStyle}>Purpose</th>
                <th style={thStyle}>Data Shared</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>
                  <strong>Supabase</strong>
                </td>
                <td style={tdStyle}>Database and authentication</td>
                <td style={tdStyle}>
                  Account data, business data, application data
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Stripe</strong>
                </td>
                <td style={tdStyle}>Payment processing</td>
                <td style={tdStyle}>
                  Name, email, billing address, payment method details
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>OpenAI</strong>
                </td>
                <td style={tdStyle}>AI content generation</td>
                <td style={tdStyle}>
                  Text prompts, uploaded images and job details used for AI
                  processing
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Blotato</strong>
                </td>
                <td style={tdStyle}>Social media publishing</td>
                <td style={tdStyle}>
                  Generated content, social media account tokens
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Vercel</strong>
                </td>
                <td style={tdStyle}>Hosting and analytics</td>
                <td style={tdStyle}>
                  Usage data, IP address, device information
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            Each third-party provider operates under its own privacy policy. We
            encourage you to review their policies. We do not sell your personal
            information to any third party.
          </p>
        </Section>

        <Section title="6. Data Storage and Security">
          <p>
            Your data is stored on servers located in Australia and the United
            States, operated by our infrastructure providers (Supabase and Vercel).
            We implement appropriate technical and organisational measures to
            protect your data, including:
          </p>
          <ul style={listStyle}>
            <li>Encryption of data in transit (TLS/SSL) and at rest</li>
            <li>
              Secure authentication via Supabase Auth with support for
              multi-factor authentication
            </li>
            <li>
              Role-based access controls limiting employee access to personal data
            </li>
            <li>Regular security reviews and monitoring</li>
          </ul>
          <p>
            While we take reasonable steps to protect your information, no method
            of electronic storage or transmission is completely secure. We cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>We retain your personal information for as long as:</p>
          <ul style={listStyle}>
            <li>Your account is active and you maintain a subscription</li>
            <li>
              Necessary to provide the Service and fulfil the purposes described in
              this Policy
            </li>
            <li>Required by applicable law or regulation</li>
          </ul>
          <p>Specific retention periods:</p>
          <ul style={listStyle}>
            <li>
              <strong>Active account data:</strong> Retained for the duration of
              your subscription
            </li>
            <li>
              <strong>Post-cancellation data:</strong> Retained for ninety (90)
              days after account cancellation, then permanently deleted unless
              otherwise required by law
            </li>
            <li>
              <strong>Trial account data:</strong> Retained for ninety (90) days
              after the trial period ends if no subscription is activated
            </li>
            <li>
              <strong>Billing records:</strong> Retained for seven (7) years in
              compliance with Australian tax law
            </li>
            <li>
              <strong>Usage and analytics data:</strong> Aggregated and
              de-identified data may be retained indefinitely for analytical
              purposes
            </li>
          </ul>
        </Section>

        <Section title="8. Your Rights">
          <p>
            Under the Australian Privacy Act and, where applicable, the GDPR, you
            have the following rights:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Access:</strong> Request a copy of the personal information
              we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or
              incomplete data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data,
              subject to legal retention requirements
            </li>
            <li>
              <strong>Data portability:</strong> Request an export of your data in
              a structured, machine-readable format
            </li>
            <li>
              <strong>Restriction:</strong> Request that we restrict the processing
              of your personal data in certain circumstances
            </li>
            <li>
              <strong>Objection:</strong> Object to the processing of your data for
              direct marketing purposes
            </li>
            <li>
              <strong>Withdraw consent:</strong> Where processing is based on
              consent, you may withdraw consent at any time without affecting the
              lawfulness of prior processing
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>
            . We will respond to your request within thirty (30) days.
          </p>
        </Section>

        <Section title="9. International Data Transfers">
          <p>
            As our infrastructure providers operate servers in both Australia and
            the United States, your data may be transferred to and processed in
            countries outside your country of residence. Where we transfer data
            internationally, we ensure appropriate safeguards are in place,
            including:
          </p>
          <ul style={listStyle}>
            <li>
              Standard Contractual Clauses (SCCs) for transfers to countries
              without an adequacy decision under the GDPR
            </li>
            <li>
              Ensuring our service providers maintain equivalent data protection
              standards
            </li>
          </ul>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            The Platform is not intended for individuals under the age of 18. We do
            not knowingly collect personal information from children. If you
            believe that a child has provided us with personal information, please
            contact us immediately and we will take steps to delete such
            information.
          </p>
        </Section>

        <Section title="11. Australian Privacy Act Compliance">
          <p>
            We comply with the thirteen Australian Privacy Principles (APPs) set
            out in the Privacy Act 1988 (Cth), including:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>APP 1 (Open and transparent management):</strong> This Policy
              describes our data practices
            </li>
            <li>
              <strong>APP 5 (Notification of collection):</strong> We inform you at
              or before the time of collection about how your data will be used
            </li>
            <li>
              <strong>APP 6 (Use or disclosure):</strong> We only use data for the
              primary purpose for which it was collected, or for directly related
              secondary purposes
            </li>
            <li>
              <strong>APP 8 (Cross-border disclosure):</strong> We take reasonable
              steps to ensure overseas recipients comply with the APPs
            </li>
            <li>
              <strong>APP 11 (Security):</strong> We take reasonable steps to
              protect personal information from misuse, interference, loss, and
              unauthorised access
            </li>
            <li>
              <strong>APP 12 (Access):</strong> You can request access to the
              personal information we hold about you
            </li>
            <li>
              <strong>APP 13 (Correction):</strong> You can request correction of
              inaccurate information
            </li>
          </ul>
        </Section>

        <Section title="12. GDPR Compliance">
          <p>
            If you are located in the European Economic Area (EEA) or the United
            Kingdom, the following additional provisions apply:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Legal basis for processing:</strong> We process your data
              based on contractual necessity (to provide the Service), legitimate
              interests (to improve the Platform and prevent fraud), and consent
              (for marketing communications)
            </li>
            <li>
              <strong>Data Protection Officer:</strong> For GDPR-related enquiries,
              contact us at{" "}
              <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
                labofantasma@gmail.com
              </a>
            </li>
            <li>
              <strong>Supervisory authority:</strong> You have the right to lodge a
              complaint with your local data protection supervisory authority
            </li>
          </ul>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you
            of material changes by email or by posting a notice on the Platform at
            least fourteen (14) days before the changes take effect. The &quot;Last
            updated&quot; date at the top of this page indicates when this Policy
            was last revised.
          </p>
          <p>
            Your continued use of the Service after the effective date of any
            changes constitutes your acceptance of the updated Policy.
          </p>
        </Section>

        <Section title="14. Complaints">
          <p>
            If you believe we have breached the Australian Privacy Principles or
            the GDPR, you may lodge a complaint with us at the contact details
            below. We will investigate and respond within thirty (30) days.
          </p>
          <p>
            If you are not satisfied with our response, you may escalate your
            complaint to the Office of the Australian Information Commissioner
            (OAIC) at{" "}
            <a
              href="https://www.oaic.gov.au"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              www.oaic.gov.au
            </a>
            .
          </p>
        </Section>

        <Section title="15. Contact Us">
          <p>
            For any questions or concerns regarding this Privacy Policy or your
            personal information, please contact us:
          </p>
          <ul style={{ ...listStyle, listStyleType: "none", paddingLeft: 0 }}>
            <li>
              <strong>Cytron Pty Ltd</strong>
            </li>
            <li>Gold Coast, Queensland, Australia</li>
            <li>
              Email:{" "}
              <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
                labofantasma@gmail.com
              </a>
            </li>
            <li>
              Website:{" "}
              <a href="https://cytronai.com" style={linkStyle}>
                cytronai.com
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

/* ─── Shared helpers ──────────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: "#374151",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {children}
      </div>
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  textDecoration: "underline",
};

const listStyle: React.CSSProperties = {
  paddingLeft: 24,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const subheadingStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginTop: 8,
  marginBottom: 4,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
  marginTop: 4,
  marginBottom: 4,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "2px solid #e5e7eb",
  fontWeight: 600,
  color: "#1a1a1a",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "top",
};
