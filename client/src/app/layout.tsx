import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudioNorth — Photo Editor",
  description:
    "A browser-based photo editing app with non-destructive adjustments, LUT filters, crop, text overlays, and PNG/JPEG export.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Caveat:wght@600&family=Cinzel:wght@700&family=Lobster&family=Montserrat:wght@600;800&family=Outfit:wght@500;700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,700;1,400&family=Poppins:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
