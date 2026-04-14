import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — CYTRON",
  description:
    "Terms of Service for CYTRON, the AI-powered field service management platform by Cytron Pty Ltd.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 48 }}>
          Last updated: 15 April 2026
        </p>

        {/* ───────────────────────────────────────────── */}
        <Section title="1. Introduction">
          <p>
            Welcome to CYTRON (&quot;Platform&quot;, &quot;Service&quot;). These
            Terms of Service (&quot;Terms&quot;) govern your access to and use of
            the CYTRON platform, website located at{" "}
            <a href="https://cytronai.com" style={linkStyle}>
              cytronai.com
            </a>
            , and any related services provided by Cytron Pty Ltd (ABN pending)
            (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
            a company registered in Queensland, Australia.
          </p>
          <p>
            By creating an account or using the Platform, you agree to be bound by
            these Terms. If you do not agree with any part of these Terms, you must
            not use the Service.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years of age and have the legal capacity to
            enter into a binding agreement to use CYTRON. If you are using the
            Service on behalf of a business entity, you represent that you have the
            authority to bind that entity to these Terms.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            To access the Platform, you must create an account by providing
            accurate, current, and complete information. You are responsible for
            maintaining the confidentiality of your login credentials and for all
            activities that occur under your account.
          </p>
          <p>
            You agree to notify us immediately at{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>{" "}
            if you suspect any unauthorised use of your account.
          </p>
        </Section>

        <Section title="4. Description of Services">
          <p>
            CYTRON is an AI-powered field service management platform designed for
            trade professionals including electricians, plumbers, flooring
            installers, and other tradespeople. The Platform provides:
          </p>
          <ul style={listStyle}>
            <li>Job management and scheduling</li>
            <li>Quoting and invoicing tools</li>
            <li>AI-generated marketing video creation</li>
            <li>Social media content posting and management</li>
            <li>Materials price comparison</li>
            <li>Business analytics and reporting</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any feature of
            the Service at any time, with or without notice.
          </p>
        </Section>

        <Section title="5. Free Trial">
          <p>
            CYTRON offers a free trial period of thirty (30) days from the date of
            account creation. During the trial period, you will have access to the
            Platform features as described in the applicable plan.
          </p>
          <p>
            At the end of the trial period, your account will require an active
            paid subscription to continue using the Service. If you do not
            subscribe, your access to paid features will be suspended. Data
            associated with your account will be retained for a period of ninety
            (90) days following the end of the trial, after which it may be
            deleted.
          </p>
        </Section>

        <Section title="6. Subscriptions and Billing">
          <p>
            Paid subscriptions are billed on a recurring basis (monthly or
            annually) through our payment processor, Stripe. By subscribing, you
            authorise us to charge your designated payment method at the start of
            each billing cycle.
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Pricing:</strong> All prices are listed in Australian Dollars
              (AUD) unless otherwise stated and are inclusive of GST where
              applicable.
            </li>
            <li>
              <strong>Renewals:</strong> Subscriptions renew automatically unless
              cancelled before the end of the current billing period.
            </li>
            <li>
              <strong>Cancellation:</strong> You may cancel your subscription at
              any time through your account settings. Cancellation takes effect at
              the end of the current billing period. No partial refunds are
              provided for unused portions of a billing period.
            </li>
            <li>
              <strong>Price changes:</strong> We may adjust subscription pricing
              with at least thirty (30) days&apos; notice. Continued use of the
              Service after a price change constitutes acceptance of the new
              pricing.
            </li>
          </ul>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to:</p>
          <ul style={listStyle}>
            <li>
              Use the Service for any unlawful purpose or in violation of
              applicable laws
            </li>
            <li>
              Attempt to gain unauthorised access to any part of the Platform or
              its infrastructure
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the Service
            </li>
            <li>
              Upload or transmit malicious code, viruses, or harmful data
            </li>
            <li>
              Use automated means (bots, scrapers) to access the Service without
              our written consent
            </li>
            <li>
              Resell, sublicense, or redistribute the Service without authorisation
            </li>
            <li>
              Use the AI features to generate misleading, defamatory, or illegal
              content
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms without prior notice.
          </p>
        </Section>

        <Section title="8. AI-Generated Content">
          <p>
            CYTRON uses artificial intelligence to generate marketing videos,
            suggest content, and assist with various business tasks. You
            acknowledge and agree that:
          </p>
          <ul style={listStyle}>
            <li>
              AI-generated content is provided on an &quot;as is&quot; basis and
              may contain inaccuracies or errors
            </li>
            <li>
              You are solely responsible for reviewing, editing, and approving all
              AI-generated content before use or publication
            </li>
            <li>
              We do not guarantee the accuracy, completeness, or suitability of
              AI-generated output for any particular purpose
            </li>
            <li>
              AI-generated content should not be relied upon as professional,
              legal, or financial advice
            </li>
            <li>
              You are responsible for ensuring that any AI-generated content
              complies with applicable laws, industry regulations, and third-party
              rights before publishing
            </li>
          </ul>
        </Section>

        <Section title="9. Your Content and Data">
          <p>
            You retain ownership of all data, materials, and content that you
            upload or input into the Platform (&quot;Your Content&quot;). By using
            the Service, you grant us a limited, non-exclusive, worldwide licence
            to process, store, and display Your Content solely for the purpose of
            providing the Service to you.
          </p>
          <p>
            We will not sell, share, or use Your Content for purposes unrelated to
            delivering the Service, except as required by law or as described in
            our{" "}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="10. Intellectual Property">
          <p>
            All rights, title, and interest in and to the Platform, including
            software, design, branding, logos, and documentation, are and remain
            the exclusive property of Cytron Pty Ltd. These Terms do not grant you
            any rights to our intellectual property except the limited right to use
            the Service as permitted herein.
          </p>
          <p>
            You may not copy, modify, distribute, sell, or lease any part of the
            Platform or its underlying technology without our prior written
            consent.
          </p>
        </Section>

        <Section title="11. Third-Party Services">
          <p>
            The Platform integrates with third-party services including, but not
            limited to, Stripe (payments), Supabase (data infrastructure), OpenAI
            (AI processing), Blotato (social media posting), and Vercel (hosting).
            Your use of these third-party services is subject to their respective
            terms and privacy policies.
          </p>
          <p>
            We are not responsible for the availability, accuracy, or conduct of
            any third-party service, and we disclaim all liability arising from
            your use of third-party services accessed through the Platform.
          </p>
        </Section>

        <Section title="12. Service Availability">
          <p>
            We strive to maintain high availability of the Platform but do not
            guarantee uninterrupted or error-free operation. We may perform
            scheduled maintenance or updates that temporarily affect access to the
            Service. We are not liable for any downtime, data loss, or
            interruption caused by factors beyond our reasonable control.
          </p>
        </Section>

        <Section title="13. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Cytron Pty Ltd and its
            directors, employees, and agents shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, including but
            not limited to loss of profits, revenue, data, or business
            opportunities, arising out of or related to your use of the Service.
          </p>
          <p>
            Our total aggregate liability for any claims arising under these Terms
            shall not exceed the amount you paid to us in the twelve (12) months
            preceding the event giving rise to the claim.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability that cannot be
            excluded or limited under Australian Consumer Law.
          </p>
        </Section>

        <Section title="14. Indemnification">
          <p>
            You agree to indemnify and hold harmless Cytron Pty Ltd, its officers,
            directors, employees, and agents from and against any claims, damages,
            losses, liabilities, and expenses (including reasonable legal fees)
            arising out of or related to your use of the Service, your violation of
            these Terms, or your violation of any third-party rights.
          </p>
        </Section>

        <Section title="15. Termination">
          <p>
            We may suspend or terminate your account and access to the Service at
            any time, with or without cause, and with or without notice. Grounds
            for termination include, but are not limited to, breach of these Terms,
            non-payment, fraudulent activity, or conduct that we reasonably believe
            is harmful to other users or the Platform.
          </p>
          <p>
            Upon termination, your right to use the Service ceases immediately. We
            will make commercially reasonable efforts to allow you to export your
            data for a period of thirty (30) days following termination, after
            which your data may be permanently deleted.
          </p>
          <p>
            You may terminate your account at any time by contacting us at{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>{" "}
            or through your account settings.
          </p>
        </Section>

        <Section title="16. Modifications to Terms">
          <p>
            We reserve the right to update or modify these Terms at any time. We
            will notify you of material changes by email or by posting a notice on
            the Platform at least fourteen (14) days before the changes take
            effect. Your continued use of the Service after the effective date
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="17. Governing Law and Dispute Resolution">
          <p>
            These Terms are governed by and construed in accordance with the laws
            of Queensland, Australia. Any disputes arising out of or in connection
            with these Terms shall be subject to the exclusive jurisdiction of the
            courts of Queensland, Australia.
          </p>
          <p>
            Before initiating any legal proceedings, you agree to attempt to
            resolve any dispute with us through good-faith negotiation for a period
            of at least thirty (30) days.
          </p>
        </Section>

        <Section title="18. Severability">
          <p>
            If any provision of these Terms is found to be invalid, illegal, or
            unenforceable by a court of competent jurisdiction, the remaining
            provisions shall continue in full force and effect.
          </p>
        </Section>

        <Section title="19. Entire Agreement">
          <p>
            These Terms, together with our{" "}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            , constitute the entire agreement between you and Cytron Pty Ltd
            regarding your use of the Service and supersede all prior agreements,
            understandings, or representations.
          </p>
        </Section>

        <Section title="20. Contact Us">
          <p>
            If you have any questions about these Terms of Service, please contact
            us:
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
