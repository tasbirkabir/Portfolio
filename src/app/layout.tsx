import type { Metadata } from "next";
import { Geist, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
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
  ],
  authors: [{ name: "Tasbir Kabir" }],
  openGraph: {
    title: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
    description:
      "I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasbir Kabir — AI Consultant, Web Developer & Media Buyer",
    description:
      "I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.",
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
