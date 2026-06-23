import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // only used in admin, don't block initial render
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false, // reader font, not needed for initial paint
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tasbirkabir.site"),
  title: {
    default: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
    template: "%s — Tasbir Kabir",
  },
  description:
    "Tasbir Kabir builds AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster. Based in Dhaka, Bangladesh.",
  keywords: [
    "Tasbir Kabir",
    "AI consultant",
    "web developer",
    "media buyer",
    "AI agents",
    "automation",
    "n8n",
    "Dhaka",
    "Bangladesh",
    "digital systems",
    "Claude",
    "OpenAI",
    "Make.com",
    "lead generation",
    "business automation",
  ],
  authors: [{ name: "Tasbir Kabir" }],
  creator: "Tasbir Kabir",
  publisher: "Tasbir Kabir",
  alternates: {
    canonical: "https://www.tasbirkabir.site",
  },
  openGraph: {
    title: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
    description:
      "I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster. Based in Dhaka, Bangladesh.",
    type: "website",
    locale: "en_US",
    siteName: "Tasbir Kabir",
    url: "https://www.tasbirkabir.site",
    images: [{ url: "/images/logo.webp", width: 800, height: 800, alt: "Tasbir Kabir — AI Consultant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
    description:
      "I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.",
    images: ["/images/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/images/logo.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="icon" href="/images/logo-small.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/images/logo.webp" />
      </head>
      <body
        className={`${geistSans.variable} ${instrumentSerif.variable} ${newsreader.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
