/**
 * JSON-LD schema generators for SEO + GEO (Generative Engine Optimization).
 *
 * These produce structured-data objects that search engines (Google, Bing) and
 * AI answer engines (ChatGPT, Perplexity, Gemini, Claude) use to understand and
 * cite the site's content.
 */

const SITE_URL = "https://tasbirkabir.site";
const SITE_NAME = "Tasbir Kabir";
const SITE_TAGLINE = "AI Consultant, Web Developer & Media Buyer — Dhaka, Bangladesh";

/** Person schema — the core identity markup for the personal brand. */
export function personSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s?.brandName || SITE_NAME,
    description: s?.seoDesc || SITE_TAGLINE,
    url: SITE_URL,
    image: s?.heroImage || `${SITE_URL}/images/logo.webp`,
    jobTitle: "AI Consultant · Web Developer · Media Buyer",
    worksFor: {
      "@type": "Organization",
      name: s?.brandName || SITE_NAME,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "Bangladesh",
    },
    nationality: { "@type": "Country", name: "Bangladesh" },
    knowsAbout: [
      "AI Agents", "Automation Systems", "Web Development", "Media Buying",
      "Digital Marketing", "Lead Generation", "Business Automation", "n8n", "Make",
      "OpenAI", "Claude", "Next.js", "WordPress", "ChatGPT", "Artificial Intelligence",
    ],
    knowsLanguage: ["en", "bn"],
    award: ["60+ projects delivered", "98% client satisfaction"],
    sameAs: [
      s?.socialLinkedin || "https://www.linkedin.com/in/tasbirrkabir",
      s?.socialTwitter || "https://x.com/tasbirrkabir",
      s?.socialGithub || "https://github.com/tasbirkabir",
      s?.socialFacebook || "https://www.facebook.com/share/1Tf65s6PB7/",
    ].filter(Boolean),
  };
}

/** Organization schema — wraps the personal brand as a business entity. */
export function organizationSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s?.brandName || SITE_NAME,
    url: SITE_URL,
    logo: s?.logoUrl || `${SITE_URL}/images/logo.webp`,
    description: s?.seoDesc || SITE_TAGLINE,
    founder: {
      "@type": "Person",
      name: s?.brandName || SITE_NAME,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "Bangladesh",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: s?.contactEmail || "tasbirrkabir@gmail.com",
    },
    sameAs: [
      s?.socialLinkedin || "https://www.linkedin.com/in/tasbirrkabir",
      s?.socialTwitter || "https://x.com/tasbirrkabir",
      s?.socialGithub || "https://github.com/tasbirkabir",
      s?.socialFacebook || "https://www.facebook.com/share/1Tf65s6PB7/",
    ].filter(Boolean),
  };
}

/** WebSite schema — with SearchAction for sitelinks search box. */
export function websiteSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s?.brandName || SITE_NAME,
    url: SITE_URL,
    description: s?.seoDesc || SITE_TAGLINE,
    publisher: {
      "@type": "Person",
      name: s?.brandName || SITE_NAME,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?v=search&q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** ProfilePage schema — for the homepage (helps AI engines identify the person). */
export function profilePageSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: s?.brandName || SITE_NAME,
      description: s?.seoDesc || SITE_TAGLINE,
      jobTitle: "AI Consultant · Web Developer · Media Buyer",
    },
    url: SITE_URL,
  };
}

/** AboutPage schema. */
export function aboutPageSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: s?.aboutTitle || "About Tasbir Kabir",
    description: s?.aboutBio?.slice(0, 200) || SITE_TAGLINE,
    mainEntity: personSchema(s),
    url: `${SITE_URL}/?v=about`,
  };
}

/** ContactPage schema. */
export function contactPageSchema(s?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Tasbir Kabir",
    url: `${SITE_URL}/?v=contact`,
    mainEntity: {
      "@type": "Person",
      name: s?.brandName || SITE_NAME,
      email: s?.contactEmail || "tasbirrkabir@gmail.com",
      telephone: s?.contactPhone || undefined,
    },
  };
}

/** Book schema — for individual ebook sales pages. */
export function bookSchema(book: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description || book.subtitle,
    author: {
      "@type": "Person",
      name: SITE_NAME,
    },
    url: `${SITE_URL}/?v=book&slug=${book.slug}`,
    image: `${SITE_URL}/images/logo.webp`,
    numberOfPages: book.pages,
    bookFormat: "https://schema.org/EBook",
    offers: {
      "@type": "Offer",
      price: book.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/?v=book&slug=${book.slug}`,
    },
    aggregateRating: book.reviewsCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: book.rating,
      reviewCount: book.reviewsCount,
    } : undefined,
  };
}

/** Product schema — for ebooks as digital products (richer than Book alone). */
export function productSchema(book: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.description || book.subtitle,
    brand: { "@type": "Brand", name: SITE_NAME },
    image: `${SITE_URL}/images/logo.webp`,
    offers: {
      "@type": "Offer",
      price: book.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10),
    },
    aggregateRating: book.reviewsCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: book.rating,
      reviewCount: book.reviewsCount,
    } : undefined,
  };
}

/** Article schema — for blog posts. */
export function articleSchema(post: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover || `${SITE_URL}/images/logo.webp`,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.webp` },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
    keywords: typeof post.tags === "string" ? (() => { try { return JSON.parse(post.tags).join(", "); } catch { return post.tags; } })() : (Array.isArray(post.tags) ? post.tags.join(", ") : post.tags),
    url: `${SITE_URL}/?v=post&slug=${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/?v=post&slug=${post.slug}`,
    },
  };
}

/** BreadcrumbList schema — for navigation context. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQPage schema — for FAQ sections (rich results + AI citation). */
export function faqPageSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

/** CollectionPage schema — for the books listing page. */
export function collectionPageSchema(books: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ebooks & Playbooks",
    description: "Digital ebooks and frameworks by Tasbir Kabir covering AI, automation, marketing, and business systems.",
    url: `${SITE_URL}/?v=books`,
    hasPart: books.map((b) => ({
      "@type": "Book",
      name: b.title,
      author: { "@type": "Person", name: SITE_NAME },
    })),
  };
}
