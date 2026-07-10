-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "pages" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "coverStyle" TEXT NOT NULL,
    "badge" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "buyers" INTEGER NOT NULL DEFAULT 0,
    "accessType" TEXT NOT NULL DEFAULT 'paid',
    "status" TEXT NOT NULL DEFAULT 'published',
    "whatYouLearn" TEXT NOT NULL DEFAULT '[]',
    "chapters" TEXT NOT NULL DEFAULT '[]',
    "faq" TEXT NOT NULL DEFAULT '[]',
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "content" TEXT NOT NULL DEFAULT '[]',
    "seoTitle" TEXT,
    "seoDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accessType" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'published',
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "pages" INTEGER,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "readTime" INTEGER NOT NULL,
    "cover" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "seoTitle" TEXT,
    "seoDesc" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "bookSlug" TEXT,
    "avatar" TEXT,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "profileImage" TEXT,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapterIndex" INTEGER NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT,
    "items" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "txnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSub" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "segment" TEXT NOT NULL DEFAULT 'all',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'all',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroEyebrow" TEXT NOT NULL DEFAULT 'AI Consultant ┬╖ Web Developer ┬╖ Media Buyer ΓÇö Dhaka, Bangladesh',
    "heroTitle" TEXT NOT NULL DEFAULT 'I build the future. Digital systems.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Hey, I''m Tasbir. I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.',
    "heroCta1" TEXT NOT NULL DEFAULT 'Explore the books',
    "heroCta2" TEXT NOT NULL DEFAULT 'Work with me',
    "heroCta1View" TEXT NOT NULL DEFAULT 'books',
    "heroCta2View" TEXT NOT NULL DEFAULT 'contact',
    "heroImage" TEXT NOT NULL DEFAULT '/images/logo.webp',
    "heroAvatarStripText" TEXT NOT NULL DEFAULT '60+ projects delivered across web ┬╖ AI ┬╖ automation',
    "homeStats" TEXT NOT NULL DEFAULT '[]',
    "homeWhatIBuildEyebrow" TEXT NOT NULL DEFAULT 'What I Build',
    "homeWhatIBuildTitle" TEXT NOT NULL DEFAULT 'Five systems. One operating system for your business.',
    "homeWhatIBuild" TEXT NOT NULL DEFAULT '[]',
    "homeFeaturedEyebrow" TEXT NOT NULL DEFAULT 'Featured ebook',
    "homeSocialProofEyebrow" TEXT NOT NULL DEFAULT 'Loved by clients',
    "homeSocialProofTitle" TEXT NOT NULL DEFAULT 'What clients say about the work',
    "homeResourcesEyebrow" TEXT NOT NULL DEFAULT 'Free downloads',
    "homeResourcesTitle" TEXT NOT NULL DEFAULT 'Resources & lead magnets',
    "aboutEyebrow" TEXT NOT NULL DEFAULT 'About',
    "aboutTitle" TEXT NOT NULL DEFAULT 'Building digital systems that scale.',
    "aboutBio" TEXT NOT NULL DEFAULT 'Hey, I''m Tasbir Kabir ΓÇö AI Consultant, Web Developer, and Media Buyer based in Dhaka, Bangladesh.

For over 3 years, I''ve been helping businesses establish and grow their digital presence through websites, marketing systems, and automation.

Along the way, I discovered that many repetitive processes could be streamlined and enhanced using AI. Today, I build AI agents, automation systems, and AI-integrated websites that help businesses operate more efficiently and grow faster.',
    "aboutMissionQuote" TEXT NOT NULL DEFAULT 'The best systems work for you even when you''re offline.',
    "aboutMissionBody" TEXT NOT NULL DEFAULT 'I combine AI and digital strategy to create systems that drive real business growth ΓÇö from intelligent workflows to conversion-focused web experiences. Every system I build is designed to save time, generate leads, and scale.

I don''t just deliver ΓÇö I teach you how to run and modify the system yourself, step by step. Because the system you understand is the system that compounds.',
    "aboutServicesEyebrow" TEXT NOT NULL DEFAULT 'What I build & teach',
    "aboutServicesTitle" TEXT NOT NULL DEFAULT 'From idea to automated business',
    "aboutServicesSubtitle" TEXT NOT NULL DEFAULT 'Four services, one operating system. Each one plugs into the next ΓÇö so your business runs on systems, not on you.',
    "aboutServices" TEXT NOT NULL DEFAULT '[]',
    "aboutProcessEyebrow" TEXT NOT NULL DEFAULT 'How it works',
    "aboutProcessTitle" TEXT NOT NULL DEFAULT 'Simple process, serious results',
    "aboutProcess" TEXT NOT NULL DEFAULT '[]',
    "aboutTimelineEyebrow" TEXT NOT NULL DEFAULT 'The path',
    "aboutTimelineTitle" TEXT NOT NULL DEFAULT '3+ years, one focus',
    "aboutTimeline" TEXT NOT NULL DEFAULT '[]',
    "aboutAchievements" TEXT NOT NULL DEFAULT '[]',
    "aboutCtaTitle" TEXT NOT NULL DEFAULT 'Ready to build smarter?',
    "aboutCtaDesc" TEXT NOT NULL DEFAULT 'Start with the AI Agency Operating System, or browse the whole library.',
    "brandName" TEXT NOT NULL DEFAULT 'Tasbir Kabir',
    "brandTagline" TEXT NOT NULL DEFAULT 'Build ┬╖ Automate ┬╖ Scale ┬╖ Optimize ┬╖ Repeat',
    "logoUrl" TEXT NOT NULL DEFAULT '/images/logo.webp',
    "faviconUrl" TEXT NOT NULL DEFAULT '/images/logo.webp',
    "ogImageUrl" TEXT NOT NULL DEFAULT '/images/logo.webp',
    "accentColor" TEXT NOT NULL DEFAULT '#b45309',
    "footerBio" TEXT NOT NULL DEFAULT 'AI Consultant, Web Developer & Media Buyer based in Dhaka, Bangladesh. I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.',
    "footerCopyright" TEXT NOT NULL DEFAULT 'Tasbir Kabir ΓÇö AI Consultant & Web Developer',
    "footerTagline" TEXT NOT NULL DEFAULT 'Build ┬╖ Automate ┬╖ Scale ┬╖ Optimize ┬╖ Repeat',
    "footerColumns" TEXT NOT NULL DEFAULT '[]',
    "socialLinkedin" TEXT NOT NULL DEFAULT 'https://www.linkedin.com/in/tasbirrkabir',
    "socialTwitter" TEXT NOT NULL DEFAULT 'https://x.com/tasbirrkabir',
    "socialGithub" TEXT NOT NULL DEFAULT 'https://github.com/tasbirkabir',
    "socialFacebook" TEXT NOT NULL DEFAULT 'https://www.facebook.com/share/1Tf65s6PB7/',
    "socialEmail" TEXT NOT NULL DEFAULT 'mailto:tasbirrkabir@gmail.com',
    "contactEmail" TEXT NOT NULL DEFAULT 'tasbirrkabir@gmail.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+880 1700 000000',
    "seoTitle" TEXT NOT NULL DEFAULT 'Tasbir Kabir ΓÇö AI Consultant, Web Developer & Media Buyer',
    "seoDesc" TEXT NOT NULL DEFAULT 'I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.',
    "navItems" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "refSlug" TEXT,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meta" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryAccess_userEmail_itemType_itemSlug_key" ON "LibraryAccess"("userEmail", "itemType", "itemSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_bookSlug_key" ON "ReadingProgress"("userId", "bookSlug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSub_email_key" ON "NewsletterSub"("email");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

