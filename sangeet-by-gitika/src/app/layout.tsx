import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "react-hot-toast";
import StructuredData from "./components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SanGeet by Gitika - Luxury Handcrafted Bags & Accessories",
  description: "Discover exquisite handcrafted bags, potlis, clutches, and accessories. Premium quality, elegant designs for the modern woman. Shop totes, slings, handbags & more.",
  keywords: "luxury bags, handcrafted accessories, potli bags, designer handbags, clutch bags, tote bags, sling bags, SanGeet by Gitika, premium handbags, handmade bags",
  authors: [{ name: "SanGeet by Gitika" }],
  creator: "SanGeet by Gitika",
  publisher: "SanGeet by Gitika",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://sangeetbygitika.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sangeetbygitika.com",
    title: "SanGeet by Gitika - Luxury Handcrafted Bags",
    description: "Exquisite handcrafted bags and accessories for the modern woman. Premium quality, elegant designs.",
    siteName: "SanGeet by Gitika",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SanGeet by Gitika - Luxury Handbags",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SanGeet by Gitika - Luxury Handcrafted Bags",
    description: "Exquisite handcrafted bags and accessories for the modern woman",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#d6a8e9" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} antialiased`}
      >
        <WishlistProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#fff",
                  color: "#333",
                  border: "1px solid #D4AF37",
                },
                success: {
                  iconTheme: {
                    primary: "#D4AF37",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
