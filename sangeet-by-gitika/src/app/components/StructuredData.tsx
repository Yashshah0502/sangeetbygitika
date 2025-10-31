export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sangeet by Gitika",
    url: "https://sangeetbygitika.com",
    logo: "https://sangeetbygitika.com/logo.png",
    description: "Luxury handcrafted bags and accessories for the modern woman",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-4809522965",
      contactType: "Customer Service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://instagram.com/sangeetbygitika",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sangeet by Gitika",
    url: "https://sangeetbygitika.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://sangeetbygitika.com/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
