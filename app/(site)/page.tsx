import Home from "@/components/marketing/home";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "CYTRON",
  url: "https://cytronai.com",
  description: "Cytron automates enquiries, missed calls, bookings, reminders, quotes and invoices for Gold Coast trades, clinics, property, hospitality and retail.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Gold Coast, Queensland, Australia",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gold Coast",
    addressRegion: "QLD",
    addressCountry: "AU",
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Home />
    </>
  );
}
