// Update testimonials with real client quotes from tasbirkabir.site
import { db } from "../src/lib/db";

const REAL_TESTIMONIALS = [
  { name: "Client 01", role: "Business Owner", quote: "Tasbir delivered exactly what we needed. The website was fast, professional, and helped us generate more inquiries than before.", rating: 5, bookSlug: null },
  { name: "Client 02", role: "Operations Manager", quote: "The automation system saved our team hours every week. Everything now runs much more efficiently.", rating: 5, bookSlug: null },
  { name: "Client 03", role: "Startup Founder", quote: "Working with Tasbir was smooth from start to finish. Communication was excellent and delivery exceeded expectations.", rating: 5, bookSlug: null },
  { name: "Client 04", role: "Company Director", quote: "Our new website looks modern, loads fast, and performs significantly better than our previous version.", rating: 5, bookSlug: null },
  { name: "Client 05", role: "Agency Owner", quote: "The AI integration helped automate repetitive tasks and improved our workflow immediately.", rating: 5, bookSlug: null },
  { name: "Client 06", role: "Marketing Manager", quote: "Professional service, attention to detail, and great support throughout the entire project.", rating: 5, bookSlug: null },
  { name: "Client 07", role: "Entrepreneur", quote: "One of the best developers we've worked with. Reliable, knowledgeable, and focused on results.", rating: 5, bookSlug: null },
  { name: "Client 08", role: "Business Consultant", quote: "The project was delivered on time and the final result exceeded our expectations.", rating: 5, bookSlug: null },
  { name: "Client 09", role: "Small Business Owner", quote: "From website development to automation, everything was handled professionally and efficiently.", rating: 5, bookSlug: null },
];

async function main() {
  // Remove existing non-book testimonials, keep book-linked ones.
  await db.testimonial.deleteMany({ where: { bookSlug: null } });

  for (const t of REAL_TESTIMONIALS) {
    await db.testimonial.create({ data: t });
  }

  const count = await db.testimonial.count();
  console.log(`Testimonials updated. Total now: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
