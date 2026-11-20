import Home from "@/components/marketing/home";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "CYTRON",
  url: "https://cytronai.com",
  description: "Cytron specialises in automating repetitive office tasks for Australian trade, wholesale, e-commerce and warehouse operations.",
  areaServed: {
    "@type": "Country",
    name: "Australia",
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
