import type { Metadata, Viewport } from "next";
import { Inter, Bad_Script } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SkipToContent from "@/components/layout/SkipToContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const badScript = Bad_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ameliea",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7ef' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1620' },
  ],
};

export const metadata: Metadata = {
  title: "Ameliea — Premium Digital Invitations",
  description: "Love, elegance, and the beauty of the soul—crafted into a digital invitation. An invitation that feels like a vow.",
  keywords: ["premium invitations", "wedding invitations", "digital RSVP", "elite wedding", "luxury invitations", "bespoke invitations"],
  authors: [{ name: "Ameliea" }],
  creator: "Ameliea",
  publisher: "Ameliea",
  openGraph: {
    title: "Ameliea — Premium Digital Invitations",
    description: "An invitation that feels like a vow.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["tr_TR"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    languages: {
      'en': '/en',
      'tr': '/tr',
    },
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
        <link rel="canonical" href="https://www.ameliea.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ameliea",
              "description": "Premium digital invitations crafted with love, elegance, and the beauty of the soul.",
              "url": "https://www.ameliea.co",
              "logo": "https://www.ameliea.co/logo.png",
              "sameAs": ["https://instagram.com/Ameliea.co"],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "amelieadestek@gmail.com",
                "contactType": "Customer Service",
                "availableLanguage": ["English", "Turkish"]
              }
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${badScript.variable} antialiased`} suppressHydrationWarning>
        <SkipToContent />
        <ErrorBoundary>
          <I18nProvider>
            <div id="main-content">
              {children}
            </div>
            <ToastContainer />
            <SpeedInsights />
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
