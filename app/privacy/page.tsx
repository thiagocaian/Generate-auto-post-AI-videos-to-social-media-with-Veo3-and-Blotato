import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy — CYTRON",
  description:
    "Privacy Policy for CYTRON. How Cytron handles a Free Automation Assessment request and the information used to automate repetitive office tasks.",
});

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
          Last updated: 24 November 2026
        </p>

        {/* TODO(Thiago/legal): Confirm Cytron Pty Ltd is the contracting entity. Leave the ABN wording exactly as "ABN pending". Do not insert an ABN. */}
        <Section title="1. Introduction">
          <p>
            Cytron Pty Ltd (ABN pending) (&quot;Company&quot;, &quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;) operates the CYTRON website at{" "}
            <a href="https://cytronai.com" style={linkStyle}>
              cytronai.com
            </a>{" "}
            and the automation service described on that website
            (&quot;Service&quot;). Cytron automates repetitive office tasks for
            trade, wholesale, e-commerce and warehouse or fulfilment operations.
            The public offer is a Free Automation Assessment, a read-only shadow
            test before an automation acts, and monthly plans published on the
            Pricing page.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose and
            protect personal information when you use the website or ask us to
            run an automation.
          </p>
          <p>
            We handle personal information in accordance with the Privacy Act
            1988 (Cth) and the Australian Privacy Principles (APPs). Where it
            applies, we also follow the European Union General Data Protection
            Regulation (GDPR).
          </p>
          <p>
            By using the website or sending an assessment request, you
            acknowledge this Privacy Policy. If you do not agree, please do not
            use the Service.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 style={subheadingStyle}>2.1 Information you give us</h3>
          <p>
            The Free Automation Assessment form asks for your name, email
            address and business name. You may also give a phone number, a
            website, and a description of the task that takes your team&apos;s
            time. You are asked to tick a consent box before the request is
            saved. The words on the form are:
          </p>
          <p>
            &quot;I agree that Cytron may store this request, use Google Gemini
            to draft an internal assessment, and notify the Cytron team on
            Telegram. Cytron will not email me automatically about this
            request.&quot;
          </p>
          <p>
            If you later engage Cytron, we collect the business information
            needed to design and run the automations you agree to. Depending on
            the workflow, that can include enquiry and message content, booking
            details, reminder details, invoice and payment-status details, lead
            details, and order, stock or dispatch details. We connect only the
            tools the workflow needs, such as Xero, MYOB, Shopify, HubSpot,
            Google Workspace, Microsoft 365 or a shipping tool you already use.
            Those tools remain your accounts.
          </p>
          <p>
            We also keep emails and other messages you send us, for example when
            you write to{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>
            .
          </p>

          <h3 style={subheadingStyle}>2.2 Information collected automatically</h3>
          <p>When you use the website, we process:</p>
          <ul style={listStyle}>
            <li>
              Technical data needed to serve the page, including IP address,
              browser type, device type and the page requested. The site is
              hosted by Vercel.
            </li>
            <li>
              Visit and performance data through Vercel Analytics and Speed
              Insights, such as pages viewed, referring page, and browser and
              device type.
            </li>
            <li>
              With an assessment request, a one-way hash of the IP address (the
              raw IP address is not stored on the request) and the browser user
              agent. The hash is used to limit repeated requests.
            </li>
          </ul>
          {/* TODO(Thiago/legal): Confirm the exact fields Vercel Analytics and Speed Insights receive in this project, and whether any non-essential cookie is set on the marketing pages. Do not add a cookie banner claim until that inventory is confirmed. */}

          <h3 style={subheadingStyle}>2.3 Information from tools you connect</h3>
          <p>
            When an agreed automation reads or updates a system you already use,
            we receive the records that workflow needs from that system, on your
            instruction.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use personal information to:</p>
          <ul style={listStyle}>
            <li>Store and review a Free Automation Assessment request</li>
            <li>
              Use Google Gemini to draft an internal assessment of the enquiry
              for Cytron staff. That draft is not sent to you automatically and
              is not a quote or professional advice.
            </li>
            <li>
              Notify the Cytron team on Telegram that a request has been saved
            </li>
            <li>
              Have a person at Cytron contact you about the request, in person
              on the Gold Coast or online
            </li>
            <li>
              Design, shadow-test, run and monitor the automations you agree to,
              including holding exceptions for a person and keeping a log of what
              ran
            </li>
            <li>
              Measure how the website is used and how it performs, and limit
              abuse of the assessment form
            </li>
            <li>Meet legal and tax obligations</li>
          </ul>
          <p>
            We do not email you automatically about an assessment request. The
            form does not add you to a mailing list. A person at Cytron may
            still contact you using the details you provided.
          </p>
          {/* TODO(Thiago/legal): Confirm that staff follow-up by email or phone is intended, as the contact page says a person gets in touch, while the form says Cytron will not email automatically about the request. */}
        </Section>

        <Section title="4. Cookies and Similar Technologies">
          <p>
            The assessment form does not set its own cookie. Vercel Analytics
            and Speed Insights measure visits and performance. Vercel, as the
            host, also processes the technical data required to deliver each
            page.
          </p>
          <p>
            If you sign in to an area of the site that uses an account, a
            session cookie may be set so the sign-in can be recognised. You can
            control cookies in your browser. Blocking a session cookie can stop
            a signed-in area from working.
          </p>
          {/* TODO(Thiago/legal): The public footer still links to client login. That login belongs to an older application and is not the service described on the current marketing pages. Decide whether this policy should cover it. Do not describe that older application here until that decision is made. */}
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            We share personal information with the service providers below, only
            so we can operate the website and the assessment. We do not sell
            personal information.
          </p>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Provider</th>
                <th style={thStyle}>Purpose</th>
                <th style={thStyle}>Data shared</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>
                  <strong>Supabase</strong>
                </td>
                <td style={tdStyle}>
                  Storing the assessment request and the internal draft
                </td>
                <td style={tdStyle}>
                  Name, email, phone if you provided one, business name, website
                  if you provided one, the task you describe, the consent text
                  and the time you agreed, a hash of your IP address, your
                  browser user agent, and the internal draft when one is
                  produced. Industry, monthly enquiry volume and a preferred date
                  and time are stored if they are submitted.
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Google Gemini</strong>
                </td>
                <td style={tdStyle}>
                  Drafting an internal assessment of the enquiry
                </td>
                <td style={tdStyle}>
                  Name, business name, website if you provided one, and the task
                  description as you typed it. If the request includes them,
                  also industry, monthly enquiry volume, and a preferred date
                  and time. The email and phone fields are not sent to Google.
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Telegram</strong>
                </td>
                <td style={tdStyle}>Internal team notification</td>
                <td style={tdStyle}>
                  Name, business name, an internal fit label and score when a
                  draft is produced, a short summary of that draft, and a link
                  to the internal record. Email addresses and phone numbers are
                  removed from the message before it is sent. Your email and
                  phone are not included as their own fields. If a draft cannot
                  be produced, the message says the request was saved and that
                  the assessment did not finish.
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>
                  <strong>Vercel</strong>
                </td>
                <td style={tdStyle}>
                  Hosting, Vercel Analytics and Speed Insights
                </td>
                <td style={tdStyle}>
                  Pages viewed, referring page, browser and device information,
                  and network information such as IP address
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            Each provider handles information under its own privacy policy. An
            agreed automation may also read or update a tool you already use,
            under your account with that provider. That connection is part of
            the workflow you approve. It is not one of the providers in the
            table above.
          </p>
          {/* TODO(Thiago/legal): Confirm any further processor used once a client automation is running, including any model other than this website's Google Gemini call, and any email, SMS or phone provider. Name only what production actually uses. Do not name internal workflow, shipping or social-posting tools. */}
          {/* TODO(Thiago/legal): The services page mentions a pay-by-link. This policy does not name a card processor because the current marketing pages and the assessment code do not take card payments. Confirm who collects card details before adding a provider. */}
          {/* TODO(Thiago/legal): Stripe, email delivery and the older application routes are still in the codebase. They are not used by the assessment form or the Pricing page. Add them here only if they process personal information for the current offer. */}
        </Section>

        <Section title="6. Data Storage and Security">
          <p>
            Assessment requests are stored in Supabase. The website is hosted by
            Vercel. Traffic to the website is encrypted in transit. Access to
            stored assessment records is limited to the configuration used to
            operate the Service.
          </p>
          <p>
            For an automation we agree with you, the public site describes these
            controls: each client runs in an isolated environment, an automation
            starts read-only, anything unusual is held for a person, decisions
            are logged, and the automation receives only the access it needs.
          </p>
          <p>
            No method of electronic storage or transmission is completely secure.
            We cannot guarantee absolute security.
          </p>
          {/* TODO(Thiago/legal): Confirm whether data is encrypted at rest, where Supabase and Vercel are regioned for this project, and whether multi-factor authentication is offered. The previous policy named Australia and the United States and Supabase Auth multi-factor authentication. The current repo does not set a region, so those statements are not repeated. */}
        </Section>

        <Section title="7. Data Retention">
          <p>
            We keep an assessment request for as long as we need it to respond,
            to keep a record of what you asked, and to meet legal obligations.
            If you become a client, we keep the information needed to run and
            support the agreed automations during that engagement, and afterwards
            for as long as the law requires.
          </p>
          <p>
            Billing records are kept for the period Australian tax law requires.
            Visit statistics may be kept in aggregated form.
          </p>
          {/* TODO(Thiago/legal): Set the retention periods for assessment requests, automation logs and billing records. Do not publish a number of days or years until finance and legal confirm them. The previous 90-day trial rule has been removed with the free trial. */}
        </Section>

        <Section title="8. Your Rights">
          <p>
            Under the Privacy Act 1988 (Cth) and, where it applies, the GDPR,
            you may ask us to:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Access:</strong> Provide a copy of the personal information
              we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Correct information that is inaccurate
              or incomplete
            </li>
            <li>
              <strong>Deletion:</strong> Delete personal information, where the
              law allows us to
            </li>
            <li>
              <strong>Data portability:</strong> Provide an export of your
              information in a structured, commonly used format, where the GDPR
              gives you that right
            </li>
            <li>
              <strong>Restriction:</strong> Restrict processing in the
              circumstances the law allows
            </li>
            <li>
              <strong>Objection:</strong> Object to processing for direct
              marketing
            </li>
            <li>
              <strong>Withdraw consent:</strong> Withdraw consent where we rely
              on it, without affecting processing that was lawful before the
              withdrawal
            </li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>
            . We will respond within thirty (30) days.
          </p>
        </Section>

        <Section title="9. Overseas Disclosure">
          <p>
            Supabase, Vercel, Google (for Gemini) and Telegram may process the
            information we send them outside Australia. Before we disclose
            personal information overseas, we take reasonable steps so that the
            recipient handles it in line with the Australian Privacy Principles,
            as APP 8 requires.
          </p>
          {/* TODO(Thiago/legal): Confirm the countries and the transfer tool actually in place (contract, regional hosting, or otherwise). Do not state that Standard Contractual Clauses are signed unless they are. */}
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            The Service is for businesses and is not directed at anyone under 18.
            We do not knowingly collect personal information from children. If
            you believe a child has provided personal information, email us and
            we will delete it.
          </p>
        </Section>

        <Section title="11. Australian Privacy Act Compliance">
          <p>
            We aim to comply with the Australian Privacy Principles (APPs) in
            the Privacy Act 1988 (Cth), including:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>APP 1 (open and transparent management):</strong> This
              Policy describes our practices
            </li>
            <li>
              <strong>APP 5 (notification of collection):</strong> The assessment
              form and this Policy tell you what we collect and why, at or
              before the time of collection
            </li>
            <li>
              <strong>APP 6 (use or disclosure):</strong> We use personal
              information for the purpose we collected it for, or for a related
              purpose you would reasonably expect
            </li>
            <li>
              <strong>APP 8 (cross-border disclosure):</strong> We take
              reasonable steps so that an overseas recipient handles personal
              information in line with the APPs
            </li>
            <li>
              <strong>APP 11 (security):</strong> We take reasonable steps to
              protect personal information from misuse, interference, loss and
              unauthorised access
            </li>
            <li>
              <strong>APP 12 (access):</strong> You can ask for access to the
              personal information we hold about you
            </li>
            <li>
              <strong>APP 13 (correction):</strong> You can ask us to correct
              inaccurate information
            </li>
          </ul>
        </Section>

        <Section title="12. GDPR">
          <p>
            If you are in the European Economic Area or the United Kingdom, the
            following also applies:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Legal basis:</strong> We rely on your consent for the
              assessment form (to store the request, draft an internal
              assessment with Google Gemini, and notify the team on Telegram),
              on contract where we need the information to provide an automation
              you have asked for, and on legitimate interests to keep the
              website secure, limit abuse, and understand how the site performs
            </li>
            <li>
              <strong>GDPR enquiries:</strong> Email{" "}
              <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
                labofantasma@gmail.com
              </a>
            </li>
            <li>
              <strong>Supervisory authority:</strong> You may lodge a complaint
              with your local data protection authority
            </li>
          </ul>
          {/* TODO(Thiago/legal): Confirm whether a Data Protection Officer is appointed. This draft does not name one. Enquiries go to the published email only. */}
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of a material change by email, or by a notice on the website, at
            least fourteen (14) days before the change takes effect. The
            &quot;Last updated&quot; date at the top of this page is the date of
            the latest revision.
          </p>
          <p>
            If you keep using the Service after that date, you acknowledge the
            updated Policy.
          </p>
        </Section>

        <Section title="14. Complaints">
          <p>
            If you believe we have breached the Australian Privacy Principles or
            the GDPR, email the address below. We will look into the complaint
            and respond within thirty (30) days.
          </p>
          <p>
            If you are not satisfied with the response, you may contact the
            Office of the Australian Information Commissioner (OAIC) at{" "}
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
            For questions about this Privacy Policy or your personal
            information, contact:
          </p>
          <ul style={{ ...listStyle, listStyleType: "none", paddingLeft: 0 }}>
            <li>
              <strong>Cytron Pty Ltd (ABN pending)</strong>
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
