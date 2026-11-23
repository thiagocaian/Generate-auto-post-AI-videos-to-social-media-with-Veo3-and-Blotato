import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — CYTRON",
  description:
    "Terms of Service for CYTRON. Automation of repetitive office tasks, a Free Automation Assessment, and monthly plans in AUD, ex GST where applicable.",
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
          Last updated: 24 November 2026
        </p>

        {/* TODO(Thiago/legal): Confirm Cytron Pty Ltd is the contracting entity and whether it is registered in Queensland. Leave the ABN wording exactly as "ABN pending". Do not insert an ABN. The previous "company registered in Queensland" sentence is not repeated while the ABN is pending. */}
        <Section title="1. Introduction">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the
            CYTRON website at{" "}
            <a href="https://cytronai.com" style={linkStyle}>
              cytronai.com
            </a>{" "}
            and the automation service described on that website
            (&quot;Service&quot;), provided by Cytron Pty Ltd (ABN pending)
            (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;), of Gold Coast, Queensland, Australia.
          </p>
          <p>
            By requesting a Free Automation Assessment, engaging a plan, or
            otherwise using the Service, you agree to these Terms. If you do
            not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years of age and able to enter a binding
            contract. If you use the Service for a business, you confirm that
            you have authority to bind that business to these Terms.
          </p>
        </Section>

        <Section title="3. Engaging Cytron">
          <p>
            You do not need an account on the website to request an assessment.
            You must give accurate contact details. If we later give you
            credentials for a client area, you must keep them confidential and
            you are responsible for activity under those credentials.
          </p>
          <p>
            Tell us straight away at{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>{" "}
            if you believe someone else has used those credentials.
          </p>
          {/* TODO(Thiago/legal): The public footer still links to a client login for an older application. These Terms describe the current marketing offer only. Decide whether that login stays, and if it stays, give it its own terms. This PR does not change the footer. */}
        </Section>

        <Section title="4. The Service">
          <p>
            Cytron automates repetitive office tasks for trade, wholesale,
            e-commerce and warehouse or fulfilment operations. The work is
            agreed with you. It can include:
          </p>
          <ul style={listStyle}>
            <li>Replies to missed calls and messages, in your tone</li>
            <li>Bookings into the calendar or job system you already use</li>
            <li>Reminders, rescheduling and waitlist follow-up</li>
            <li>Invoices and payment links, synced to your accounts</li>
            <li>Lead capture into your CRM, and follow-up tasks</li>
            <li>
              Human review, so anything outside the agreed rules is held for a
              person
            </li>
            <li>
              Related office tasks we agree to automate, such as stock checks,
              order intake, dispatch paperwork and sales follow-up
            </li>
          </ul>
          <p>
            We connect the automation to tools you already use. The public site
            names Xero, MYOB, Shopify, HubSpot, Google Workspace, Microsoft 365
            and shipping tools. You do not have to replace those systems.
          </p>
          <p>A typical engagement follows the process on the website:</p>
          <ul style={listStyle}>
            <li>
              <strong>Assess.</strong> We map where the hours go. You get the
              top tasks worth automating first.
            </li>
            <li>
              <strong>Design.</strong> Rules are written the way your team
              decides, and you approve the rules and the messages.
            </li>
            <li>
              <strong>Build.</strong> The workflow is connected to your tools,
              then run as a read-only shadow test before it acts.
            </li>
            <li>
              <strong>Run.</strong> It is switched on one step at a time,
              monitored, and tuned with you.
            </li>
          </ul>
          <p>
            A first workflow usually goes from assessment to shadow test in a
            few weeks, depending on access to your systems. That timing is a
            guide, not a guaranteed date. We may change, pause or withdraw a
            feature of the Service.
          </p>
        </Section>

        <Section title="5. Free Automation Assessment">
          <p>
            The assessment is free and has no obligation. From the details you
            send, and a conversation with you in person on the Gold Coast or
            online, we aim to give you:
          </p>
          <ul style={listStyle}>
            <li>A map of where your team&apos;s hours go</li>
            <li>The top three tasks worth automating first</li>
            <li>A rough estimate of time and cost saved</li>
            <li>A clear next step</li>
          </ul>
          <p>
            The estimate is rough. It is not a quote, a savings guarantee or
            professional advice. Sending the form does not start a paid plan
            and does not take a payment.
          </p>
        </Section>

        <Section title="6. Plans and Fees">
          <p>
            Paid work starts only when we agree a plan with you. Prices are in
            Australian dollars (AUD) and are ex GST where applicable. Where GST
            applies, GST is added on top of the published price.
          </p>
          <p>
            As at the date of these Terms, the Pricing page publishes:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Starter:</strong> $349 per month, setup $990. One
              operational automation, with monitoring.
            </li>
            <li>
              <strong>Growth:</strong> $649 per month, setup $1,490. Automation,
              CRM, leads and follow-up.
            </li>
            <li>
              <strong>Business:</strong> $999 per month, setup $2,490. Multiple
              processes, integrations and monitoring.
            </li>
            <li>
              <strong>Enterprise:</strong> $1,499 or more per month, with a
              custom setup.
            </li>
          </ul>
          <p>
            API usage, phone and SMS are subject to included allowances or
            additional charges. The Pricing page at{" "}
            <Link href="/pricing" style={linkStyle}>
              cytronai.com/pricing
            </Link>{" "}
            is the source of the published prices. If that page is updated, the
            updated page applies to a new enquiry.
          </p>
          <p>
            The Pricing page states that there is no lock-in, and that your
            workflows, your data and your accounts stay yours.
          </p>
          <p>
            To stop a paid plan, email{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>
            .
          </p>
          {/* TODO(Thiago/legal): Confirm how the $349+ plans and setup fees are invoiced and collected. Stripe in this repo charges older low-priced plans and is not linked from the Pricing page, so these Terms do not say Stripe collects these fees. */}
          {/* TODO(Thiago/legal): Confirm the cancellation notice period, whether a setup fee or a current month is refundable, and what "no lock-in" means in the contract. Do not add those rules until confirmed. */}
          {/* TODO(Thiago/legal): The Pricing page does not state the included allowances for API usage, phone and SMS. Do not invent the amounts. */}
          {/* TODO(Thiago/legal): Confirm whether every supply is subject to GST or only some. The visible wording follows the Pricing page: ex GST where applicable, with GST added on top where it applies. */}
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to:</p>
          <ul style={listStyle}>
            <li>Use the Service to break the law</li>
            <li>
              Try to access any part of the website, an automation, or our
              systems without permission
            </li>
            <li>Interfere with the Service or with another client&apos;s work</li>
            <li>Upload or send malicious code</li>
            <li>
              Use bots or scrapers on the website without our written consent
            </li>
            <li>
              Resell or sublicense the Service without our written consent
            </li>
            <li>
              Use an automation to send misleading, defamatory or unlawful
              messages
            </li>
          </ul>
          <p>
            We may suspend the Service where we reasonably believe these rules
            have been broken.
          </p>
        </Section>

        <Section title="8. Automation and AI">
          <p>
            Rules you can check decide prices, dates and amounts. AI may draft
            messages in your tone and help with judgment calls. You approve
            messages before they are used with your customers. Anything outside
            the rules, including an unclear request or a missing detail, is held
            for a person, with the reason recorded. You can switch a step off
            and hand it back to your team.
          </p>
          <p>You acknowledge that:</p>
          <ul style={listStyle}>
            <li>
              An automation and any AI draft are provided as an operational
              aid. They can be wrong.
            </li>
            <li>
              You are responsible for the rules and the messages you approve,
              and for what is sent to your customers after approval
            </li>
            <li>
              We do not guarantee that an automation will be accurate, complete
              or fit for a purpose you have not agreed with us
            </li>
            <li>
              Output is not legal, financial, tax or other professional advice
            </li>
            <li>
              The Google Gemini draft of an assessment request is an internal
              note for Cytron staff. It is not sent to you as our advice.
            </li>
          </ul>
        </Section>

        <Section title="9. Your Information">
          <p>
            You keep ownership of the business information you provide and of
            the accounts you hold with your own tools. You give us a limited,
            non-exclusive licence to host, process and display that information
            only so we can provide the Service to you, including the internal
            assessment draft and the team notification described in our{" "}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            We do not sell your information. We do not use it for a purpose
            unrelated to the Service, except where the law requires it or the
            Privacy Policy says otherwise.
          </p>
        </Section>

        <Section title="10. Intellectual Property">
          <p>
            The website, our software, our designs, the CYTRON name and our
            documentation remain the property of Cytron Pty Ltd. These Terms
            give you a limited right to use the Service during an engagement.
            They do not transfer our intellectual property to you.
          </p>
          <p>
            You may not copy, modify, sell or lease the Service or its
            underlying technology except as these Terms allow, or with our
            prior written consent. Your own workflows, data and accounts stay
            yours, as stated on the Pricing page.
          </p>
          {/* TODO(Thiago/legal): Confirm who owns the automation rules and workflow configuration after an engagement ends. The site says "your workflows, your data, your accounts" and also that automations run on Cytron's servers. This draft does not transfer Cytron's software. */}
        </Section>

        <Section title="11. Third-Party Services">
          <p>
            The website uses Supabase to store an assessment request, Google
            Gemini to draft an internal assessment of the enquiry, Telegram to
            notify the Cytron team, and Vercel to host the site and measure
            visits and performance. Your use of those providers is also subject
            to their terms. What we send them is described in the{" "}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            An automation may connect to tools you already use. Those tools are
            your accounts. We are not responsible for a third-party service
            being unavailable, or for how that provider handles information
            under your own agreement with them.
          </p>
        </Section>

        <Section title="12. Availability">
          <p>
            We work to keep the Service available. We do not guarantee that it
            will be uninterrupted or error-free. We may need to maintain or
            change it. We are not liable for downtime or loss caused by
            something outside our reasonable control, including a failure of a
            tool you asked us to connect.
          </p>
        </Section>

        <Section title="13. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Cytron Pty Ltd and its
            directors, employees and agents are not liable for indirect,
            incidental, special, consequential or punitive loss, including loss
            of profit, revenue, data or business opportunity, arising out of
            the Service.
          </p>
          <p>
            Our total aggregate liability for claims under these Terms is
            limited to the amount you paid us in the twelve (12) months before
            the event giving rise to the claim.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability that the
            Australian Consumer Law does not allow us to exclude or limit.
          </p>
          {/* TODO(Thiago/legal): Confirm the 12-month fees cap is still appropriate. An assessment is free, so the cap can be zero before any invoice is paid. Confirm this is acceptable under the Australian Consumer Law. */}
        </Section>

        <Section title="14. Indemnity">
          <p>
            You agree to indemnify and hold harmless Cytron Pty Ltd, its
            officers, directors, employees and agents from and against any
            claims, damages, losses, liabilities and expenses (including
            reasonable legal fees) arising out of or related to your use of the
            Service, your breach of these Terms, or your infringement of any
            third-party rights.
          </p>
        </Section>

        <Section title="15. Ending the Service">
          <p>
            You may end an engagement by emailing{" "}
            <a href="mailto:labofantasma@gmail.com" style={linkStyle}>
              labofantasma@gmail.com
            </a>
            . We may suspend or stop the Service if fees that we have agreed
            and invoiced are unpaid, if these Terms are broken, or if we
            reasonably believe the use is unlawful or harmful.
          </p>
          <p>
            When an engagement ends, we will tell you what business information
            of yours we still hold and how you can receive a copy, in line with
            the Privacy Policy.
          </p>
          {/* TODO(Thiago/legal): Set the notice period and how long a client has to take a copy after the engagement ends. The previous 30-day export sentence was tied to account termination and is not restated. */}
        </Section>

        <Section title="16. Changes to These Terms">
          <p>
            We may update these Terms. We will give at least fourteen (14)
            days&apos; notice of a material change by email or by a notice on
            the website. Using the Service after the effective date means you
            accept the updated Terms. A change to a price on the Pricing page
            applies to a new enquiry, as section 6 describes.
          </p>
          {/* TODO(Thiago/legal): Confirm the 14-day notice is still wanted. It is carried over from the previous terms. The Pricing page does not state a price-change notice period. */}
        </Section>

        <Section title="17. Governing Law">
          <p>
            These Terms are governed by the laws of Queensland, Australia. The
            courts of Queensland have exclusive jurisdiction. Before starting
            proceedings, the parties will try to resolve the dispute by
            good-faith discussion for at least thirty (30) days.
          </p>
        </Section>

        <Section title="18. Severability">
          <p>
            If a court finds any part of these Terms invalid or unenforceable,
            the rest continues in force.
          </p>
        </Section>

        <Section title="19. Entire Agreement">
          <p>
            These Terms and the{" "}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>{" "}
            are the entire agreement between you and Cytron Pty Ltd about the
            Service described on the website, and they replace earlier
            discussions about that Service.
          </p>
          {/* TODO(Thiago/legal): Confirm whether a separate proposal or statement of work is required before a paid plan, and which document wins if they differ. Do not add that document to the public terms until confirmed. */}
        </Section>

        <Section title="20. Contact Us">
          <p>Questions about these Terms can be sent to:</p>
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
