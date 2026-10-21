// Content for the public industry pages (/trades, /clinics, ...).
// Stats must come from a named public source: no vendor claims, no client data.

export type Stat = { k: string; v: string; src: string; url: string };

export type Industry = {
  slug: string;
  name: string;
  icon: "wrench" | "stethoscope" | "building" | "utensils" | "bag" | "briefcase";
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: [string, string, string]; // before, accent, after
  intro: string;
  pains: string[];
  automations: { t: string; d: string }[];
  day: { time: string; t: string }[];
  stat: Stat;
  tools: string[];
  faq: { q: string; a: string }[];
};

const STAT_REPLY: Stat = {
  k: "72%",
  v: "of Australians expect a reply from a small business within an hour. 22% expect it instantly.",
  src: "Zoho, 2024",
  url: "https://itbrief.com.au/story/zoho-study-reveals-rising-customer-service-expectations-in-australia",
};

const STAT_LATE: Stat = {
  k: "$15,257",
  v: "a year is what late payments cost the average Australian small business.",
  src: "Xero Small Business Insights, Dec 2025 qtr",
  url: "https://www.xero.com/au/guides/late-payment-small-business-australia/",
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "trades",
    name: "Trades & construction",
    icon: "wrench",
    metaTitle: "Automation for Tradies on the Gold Coast | CYTRON",
    metaDescription: "Missed-call text back, quote follow-up, job reminders and invoices synced to Xero. Automation for Gold Coast plumbers, electricians, builders and trades.",
    eyebrow: "Trades & construction",
    headline: ["Never lose a job to a ", "missed call", " again."],
    intro: "You're on the tools, the phone rings, and the customer calls the next tradie on Google. Cytron answers every enquiry in seconds, follows up your quotes and gets your invoices paid, while you get on with the job.",
    pains: [
      "Calls missed while you're on a roof or under a sink",
      "Quotes sent and never followed up",
      "Evenings lost to invoices and paperwork",
      "Customers who forget the booking and aren't home",
    ],
    automations: [
      { t: "Missed-call text back", d: "Every missed call gets a text within a minute, with your business name and a link to book a time." },
      { t: "Bookings into your job app", d: "Customers pick a slot that fits your calendar. The job lands in ServiceM8 or Tradify with their details." },
      { t: "Quote follow-up", d: "Quotes that haven't been accepted get a friendly follow-up in your words, so nothing goes cold." },
      { t: "Job reminders & on-my-way texts", d: "A reminder the day before and a text when you're on the way. Fewer wasted trips to empty houses." },
      { t: "Invoice on completion", d: "The invoice goes out when the job is marked done, synced to Xero or MYOB, with polite reminders until paid." },
      { t: "Reviews after the job", d: "Happy customers get a review link. Unhappy replies come to you first, not to Google." },
    ],
    day: [
      { time: "6:40 am", t: "Today's jobs and addresses go to each tradie, in order, with the customer's notes." },
      { time: "10:15 am", t: "A call comes in while you're on site. The customer gets a text in under a minute and books a time." },
      { time: "1:00 pm", t: "A quote from last week hasn't been accepted. A friendly follow-up goes out in your words." },
      { time: "3:30 pm", t: "Job done. The invoice is sent from the van and is already in Xero." },
      { time: "6:00 pm", t: "Happy customers get a review request. You're home for dinner." },
    ],
    stat: STAT_REPLY,
    tools: ["ServiceM8", "Tradify", "simPRO", "Fergus", "Xero", "MYOB", "Google Calendar"],
    faq: [
      { q: "Does it work with ServiceM8 or Tradify?", a: "Yes. We connect to the job app you already use, so bookings, jobs and invoices stay in one place." },
      { q: "Will customers know the text is automatic?", a: "It's written in your words and signed with your business name. When they reply, it comes straight to you." },
      { q: "I'm a one-person business. Is it worth it?", a: "Often the most. When it's just you, every missed call is a missed job. The free audit will tell you honestly whether the numbers stack up." },
    ],
  },
  {
    slug: "clinics",
    name: "Clinics & allied health",
    icon: "stethoscope",
    metaTitle: "Automation for Clinics & Allied Health on the Gold Coast | CYTRON",
    metaDescription: "Appointment reminders, waitlist backfill, intake forms and recalls for Gold Coast physio, dental, chiro, psychology and allied health clinics. Works with Cliniko and Halaxy.",
    eyebrow: "Clinics & allied health",
    headline: ["Fewer ", "no-shows", ". A calmer front desk."],
    intro: "Your reception team juggles phones, walk-ins and rebookings all day. Cytron sends the reminders, fills cancelled slots from the waitlist and gets intake forms done before the patient walks in.",
    pains: [
      "Empty slots from no-shows and late cancellations",
      "Phones ringing while reception checks someone in",
      "Paper intake forms filled in at the front desk",
      "Patients who drift away after their last visit",
    ],
    automations: [
      { t: "Smart reminders", d: "SMS and email reminders that patients can confirm or reschedule by replying, without calling the clinic." },
      { t: "Waitlist backfill", d: "When someone cancels, the slot is offered to the waitlist straight away, first come, first served." },
      { t: "Intake forms before the visit", d: "New patients complete their forms online before they arrive, attached to their file." },
      { t: "Recall & rebooking", d: "Patients due for a review or a check-up get a friendly message with a booking link." },
      { t: "After-hours enquiries", d: "Questions that arrive after close get an instant reply and a link to book." },
      { t: "Daily summary for the practice manager", d: "Tomorrow's diary at a glance: confirmed, unconfirmed and gaps still open." },
    ],
    day: [
      { time: "7:00 am", t: "The practice manager gets tomorrow's diary: 38 appointments, 35 confirmed, 3 gaps." },
      { time: "9:20 am", t: "A patient cancels by text. The slot is offered to the waitlist and filled by 9:35." },
      { time: "11:00 am", t: "New patients for this afternoon have completed their intake forms online." },
      { time: "2:00 pm", t: "Patients due for a review get a friendly recall message." },
      { time: "6:30 pm", t: "After-hours enquiries get an instant reply with a booking link." },
    ],
    stat: {
      k: "+18.5%",
      v: "growth in Gold Coast health care employment in the year to August 2025. More patients, same front desk.",
      src: "Jobs and Skills Australia",
      url: "https://www.jobsandskills.gov.au/sites/default/files/2025-10/Industry%20Profile%20Gold%20Coast.pdf",
    },
    tools: ["Cliniko", "Halaxy", "Nookal", "Power Diary", "Google Workspace", "Microsoft 365"],
    faq: [
      { q: "Does it work with Cliniko?", a: "Yes. We build around your practice software, so the diary stays the single source of truth." },
      { q: "Is patient information kept safe?", a: "Automations run inside your existing accounts with the least access they need. Nothing is copied where it doesn't need to be, and every action is logged." },
      { q: "Can patients still call the clinic?", a: "Of course. Automation handles the routine messages, so your team has more time for the calls that matter." },
    ],
  },
  {
    slug: "real-estate",
    name: "Real estate & property",
    icon: "building",
    metaTitle: "Automation for Real Estate & Property Management on the Gold Coast | CYTRON",
    metaDescription: "Instant enquiry replies, inspection bookings, maintenance requests and landlord updates for Gold Coast real estate agencies and property managers.",
    eyebrow: "Real estate & property",
    headline: ["Reply to every enquiry ", "first", "."],
    intro: "Buyers and tenants enquire on several listings at once, and the agency that replies first usually gets the inspection. Cytron answers every enquiry in minutes, books inspections and keeps maintenance moving without your property managers chasing it.",
    pains: [
      "Portal enquiries piling up over the weekend",
      "Inspection times sent out one by one",
      "Maintenance requests lost between inboxes and texts",
      "Landlords asking for updates you have to dig for",
    ],
    automations: [
      { t: "Instant enquiry replies", d: "Portal and website enquiries get a reply in minutes, with the details captured and inspection times attached." },
      { t: "Inspection booking & reminders", d: "Prospects book a time themselves and get a reminder. Attendees get the application link afterwards." },
      { t: "Maintenance triage", d: "Tenants send photos, the request is sorted by urgency and sent to the right tradie with the details." },
      { t: "Tenant & landlord updates", d: "Everyone hears when a job is booked, done and invoiced, without your team writing each message." },
      { t: "Lease & compliance reminders", d: "Renewals, routine inspections and safety checks flagged well before they're due." },
      { t: "Weekly landlord report", d: "A short, consistent update for every landlord: rent, maintenance and anything coming up." },
    ],
    day: [
      { time: "Sat 8:00 am", t: "Twelve portal enquiries overnight. Each gets a reply with inspection times within minutes." },
      { time: "Sat 11:30 am", t: "Open home attendees get a thank-you and the application link." },
      { time: "Mon 7:30 am", t: "A tenant reports a leaking tap with photos. It's marked non-urgent and sent to the plumber." },
      { time: "Wed", t: "Three leases are up for renewal in 60 days. Reminders are drafted for the property manager to approve." },
      { time: "Fri", t: "Every landlord gets a short weekly update on their property." },
    ],
    stat: STAT_REPLY,
    tools: ["PropertyMe", "Console Cloud", "Rex", "Your CRM", "Google Workspace", "Microsoft 365"],
    faq: [
      { q: "Does it connect to our CRM or property management software?", a: "In most cases, yes. We check what your systems allow first, and we tell you upfront if something can't be connected." },
      { q: "Who approves what goes to landlords?", a: "You do. Anything sensitive is drafted for a person to approve before it's sent." },
      { q: "Can it handle weekend enquiries?", a: "That's where it helps most. Enquiries get a reply within minutes, any day of the week." },
    ],
  },
  {
    slug: "hospitality",
    name: "Hospitality, tourism & short-stay",
    icon: "utensils",
    metaTitle: "Automation for Hospitality, Tourism & Short-Stay on the Gold Coast | CYTRON",
    metaDescription: "Booking confirmations, pre-arrival info, guest questions and review requests for Gold Coast cafés, restaurants, tour operators and holiday rentals.",
    eyebrow: "Hospitality, tourism & short-stay",
    headline: ["Guests looked after, from booking ", "to review", "."],
    intro: "Visitors book from everywhere, at all hours, and expect answers straight away. Cytron confirms bookings, sends the right information before guests arrive, answers the common questions and asks for a review when they leave happy.",
    pains: [
      "The same questions every day: parking, check-in, what to bring",
      "Bookings arriving from several platforms at once",
      "No-shows on tours and tables",
      "Reviews you never got round to asking for",
    ],
    automations: [
      { t: "Booking confirmations", d: "Every booking gets a clear confirmation in your tone, whichever platform it came from." },
      { t: "Pre-arrival information", d: "Check-in details, parking, meeting points and what to bring, sent at the right time before arrival." },
      { t: "Guest questions answered", d: "Common questions answered from your own information. Anything unusual goes to your team with the booking attached." },
      { t: "Reminders & fewer no-shows", d: "A reminder before the table or tour, with an easy way to change the booking instead of not turning up." },
      { t: "Review requests", d: "A thank-you and a review link after checkout or the tour, while the experience is still fresh." },
      { t: "Daily operations summary", d: "Arrivals, departures, cleaning and special requests in one short list for the team each morning." },
    ],
    day: [
      { time: "7:00 am", t: "Today's arrivals, departures and cleaning list go to the team." },
      { time: "10:00 am", t: "Guests arriving tomorrow get their check-in details and parking information." },
      { time: "1:00 pm", t: "A guest asks for an early check-in. The request goes to the manager with the room status." },
      { time: "4:00 pm", t: "Tomorrow's tour group gets the meeting point and what to bring." },
      { time: "Next day", t: "Guests who checked out get a thank-you and a review link." },
    ],
    stat: STAT_REPLY,
    tools: ["Your channel manager", "Booking platforms", "WhatsApp", "Google Business Profile", "Google Sheets", "Email"],
    faq: [
      { q: "Can it work across Airbnb, Booking.com and our own website?", a: "We connect where the platforms allow it, usually through your channel manager. We confirm exactly what's possible during the audit." },
      { q: "What if a guest has an unusual request?", a: "It goes straight to a person, with the booking details attached, so nobody has to ask twice." },
      { q: "Will the messages sound robotic?", a: "They're written in your voice, and you approve them before anything goes live." },
    ],
  },
  {
    slug: "retail",
    name: "Retail & online stores",
    icon: "bag",
    metaTitle: "Automation for Retail & Online Stores on the Gold Coast | CYTRON",
    metaDescription: "Order checks, customer updates, low-stock alerts and returns for Gold Coast retailers and online stores on Shopify and WooCommerce.",
    eyebrow: "Retail & online stores",
    headline: ["More orders. ", "Less admin", " behind them."],
    intro: "Every order brings questions, updates and paperwork. Cytron checks new orders, keeps customers updated, flags low stock and handles returns, so your team can focus on selling.",
    pains: [
      "“Where's my order?” emails every single day",
      "Best-sellers running out before anyone notices",
      "Orders with wrong or incomplete addresses",
      "Returns tracked in a spreadsheet",
    ],
    automations: [
      { t: "Order checks", d: "Every new order is checked for address, items and payment before it moves on. Anything unclear is held for a person." },
      { t: "Customer updates", d: "Confirmations, shipping and delivery updates sent automatically, so customers don't have to ask." },
      { t: "Low-stock alerts", d: "A heads-up when a product drops below its reorder point, before it sells out." },
      { t: "Customer questions", d: "Common questions like order status and sizing answered instantly from your store data." },
      { t: "Returns & exchanges", d: "A simple returns flow that follows your policy and keeps everything on record." },
      { t: "Daily sales summary", d: "Today's sales, top products and anything stuck, in one short message each evening." },
    ],
    day: [
      { time: "7:30 am", t: "Overnight orders are checked. Two with unclear addresses are held for a person." },
      { time: "9:00 am", t: "A best-seller drops below its reorder point. The buyer gets an alert." },
      { time: "12:00 pm", t: "A customer asks where their order is and gets the tracking link instantly." },
      { time: "3:00 pm", t: "A return request matches the policy, so it's approved and the instructions are sent." },
      { time: "6:00 pm", t: "The owner gets today's sales, top products and anything that needs attention." },
    ],
    stat: {
      k: "9.8M",
      v: "Australian households shopped online in 2025, and online spend grew 13.9%.",
      src: "Australia Post eCommerce Report",
      url: "https://www.parcelandpostaltechnologyinternational.com/news/e-commerce/australian-online-spending-reaches-a82-6bn-in-2025.html",
    },
    tools: ["Shopify", "WooCommerce", "Square", "Xero", "Google Sheets", "Email"],
    faq: [
      { q: "Does it work with Shopify?", a: "Yes. Shopify and WooCommerce are the setups we connect to most often." },
      { q: "Will it change orders on its own?", a: "Only within rules you approve. Anything unclear is held for a person, and every action is logged." },
      { q: "We also have a physical shop. Does that matter?", a: "Not at all. In-store and online sales can feed the same reports and stock alerts." },
    ],
  },
  {
    slug: "professional-services",
    name: "Professional services",
    icon: "briefcase",
    metaTitle: "Automation for Professional Services on the Gold Coast | CYTRON",
    metaDescription: "Client onboarding, document collection, deadline reminders and invoice follow-up for Gold Coast accountants, lawyers, consultants and agencies.",
    eyebrow: "Professional services",
    headline: ["Spend your hours on ", "clients", ", not on chasing them."],
    intro: "Chasing documents, sending reminders and following up invoices adds up to hours you can't bill. Cytron automates the admin around your clients, so your team spends its time on the work it's paid for.",
    pains: [
      "Chasing clients for the same documents again and again",
      "Every new client onboarded by hand",
      "Deadlines tracked in someone's head",
      "Invoices that sit unpaid for weeks",
    ],
    automations: [
      { t: "Client onboarding", d: "Welcome email, forms, engagement letter and a shared folder, sent the moment a client signs up." },
      { t: "Document collection", d: "Clients get a clear list of what's needed and polite reminders until everything is in." },
      { t: "Deadline & renewal reminders", d: "Due dates tracked for every client, with reminders for them and for your team." },
      { t: "Meeting scheduling & prep", d: "Clients book a time themselves, and the meeting notes and files are ready beforehand." },
      { t: "Invoice follow-up", d: "Overdue invoices get a friendly nudge in your tone, escalating only when it should." },
      { t: "Weekly workload report", d: "What was done, what's waiting on clients and what's due next week, every Friday." },
    ],
    day: [
      { time: "Mon 8:00 am", t: "The team gets the week ahead: deadlines, meetings and what each client still has to send." },
      { time: "Tue", t: "A new client signs up. The welcome email, forms and shared folder go out automatically." },
      { time: "Wed", t: "Three clients haven't sent their documents. Two get a reminder; the third is flagged for a call from you." },
      { time: "Thu", t: "Overdue invoices get a friendly nudge, written in your tone." },
      { time: "Fri", t: "A short report: what was done, what's waiting and what's due next week." },
    ],
    stat: STAT_LATE,
    tools: ["Microsoft 365", "Google Workspace", "Xero", "MYOB", "Calendly", "Your practice software"],
    faq: [
      { q: "We handle confidential information. Is that a problem?", a: "No. We work inside your existing accounts with the least access needed, and every action is logged." },
      { q: "Can clients still talk to a person?", a: "Always. Automation handles the reminders; your team handles the relationship." },
      { q: "How long does it take to set up?", a: "A first workflow usually goes from audit to shadow test in a few weeks, depending on access to your systems." },
    ],
  },
];

export const INDUSTRY_LINKS = INDUSTRIES.map(({ slug, name }) => ({ slug, name }));

export function getIndustry(slug: string): Industry {
  const industry = INDUSTRIES.find((i) => i.slug === slug);
  if (!industry) throw new Error(`Unknown industry: ${slug}`);
  return industry;
}
