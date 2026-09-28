import type { Metadata, Viewport } from "next";
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
  title: "SHADE — Professional Photo Editor",
  description:
    "A clean, professional dark photo editor with non-destructive adjustments, tone curves, selective control points, presets, and high-resolution export.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0d12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body className="h-full min-h-[100dvh] flex flex-col bg-[var(--bg-app)] text-[var(--text)] overflow-hidden">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
