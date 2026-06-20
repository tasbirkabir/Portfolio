// Seed demo assets for the AI Agency OS book
import { db } from "../src/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function main() {
  await mkdir(path.join(process.cwd(), "storage", "assets"), { recursive: true });

  const book = await db.book.findUnique({ where: { slug: "ai-agency-operating-system" } });
  if (!book) { console.error("Book not found"); process.exit(1); }

  // Clear existing assets
  await db.asset.deleteMany({ where: { bookId: book.id } });

  // Create demo files
  const demoPdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 24 Tf 100 700 Td (The AI Agency Operating System) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n407\n%%EOF");

  const assets = [
    { type: "pdf", label: "PDF Version", filename: "ai-agency-os.pdf", content: demoPdf, mime: "application/pdf" },
    { type: "bonus", label: "Bonus: Agency Rate Card", filename: "rate-card.txt", content: Buffer.from("AI Agency Rate Card\n\nStarter: $300+\nCore: $999-$2.5k\nPremium: $5k+\n"), mime: "text/plain" },
    { type: "template", label: "Offer One-Pager Template", filename: "offer-template.txt", content: Buffer.from("Offer One-Pager Template\n\nI help [Niche] businesses save [Hours] and capture [Result] using automated systems.\n"), mime: "text/plain" },
    { type: "worksheet", label: "Niche Validation Worksheet", filename: "niche-worksheet.txt", content: Buffer.from("Niche Validation Worksheet\n\n1. Niche: _______\n2. Pain point: _______\n3. Budget: _______\n4. Decision maker: _______\n"), mime: "text/plain" },
    { type: "prompt-pack", label: "AI Agency Prompt Pack (24 prompts)", filename: "prompt-pack.txt", content: Buffer.from("AI Agency Prompt Pack\n\n1. Cold outreach email generator\n2. Discovery call qualifier\n3. Proposal writer\n4. SOP generator\n...24 prompts total\n"), mime: "text/plain" },
  ];

  for (const a of assets) {
    const crypto = await import("crypto");
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = a.filename.split(".").pop();
    const storedFilename = `${randomName}.${ext}`;
    const filePath = path.join(process.cwd(), "storage", "assets", storedFilename);
    await writeFile(filePath, a.content);

    await db.asset.create({
      data: {
        bookId: book.id,
        type: a.type,
        label: a.label,
        filename: a.filename,
        fileSize: a.content.length,
        fileType: a.mime,
        storagePath: storedFilename,
      },
    });
    console.log(`  ✓ ${a.label} (${a.content.length} bytes)`);
  }

  const count = await db.asset.count({ where: { bookId: book.id } });
  console.log(`\nSeeded ${count} assets for "${book.title}"`);
}

main().catch(console.error).finally(() => db.$disconnect());
