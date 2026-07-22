import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Talko — Practice any language with real people",
  description:
    "Live 1-on-1 language audio practice with real learners. Find a partner instantly, or call someone online — no account required.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "Talko — Practice any language with real people",
    description:
      "Live 1-on-1 language audio practice with real learners. Find a partner instantly, or call someone online — no account required.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Talko — Speak with real people",
      },
    ],
    type: "website",
    siteName: "Talko",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talko — Practice any language with real people",
    description:
      "Live 1-on-1 language audio practice with real learners. No account required.",
    images: ["/og.png"],
  },
};

const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('talko.theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${sans.variable} ${display.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
