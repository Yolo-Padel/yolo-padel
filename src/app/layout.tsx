import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yolo-paddle - Book Padel Courts Quickly & Easily",
  description: "Find, check schedules, and book your favorite padel courts. Manage your bookings and become a member for exclusive perks at Yolo-paddle!",
  keywords: [
    "book padel court",
    "rent padel court",
    "find padel court",
    "padel court schedule",
    "padel venue",
    "padel membership",
    "Yolo-paddle",
    "play padel",
    "padel court slipi",
    "padel court booking",
    "padel court lebak bulus",
    "padel court kemang",
    "padel court jakarta",
  ],
  // This part can be our default
  authors: [{ name: "Yolo-paddle" }],
  creator: "Yolo-paddle",
  publisher: "Yolo-paddle",
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
  //Add Open Graph (OG) tags for social media sharing
  openGraph: {
    title: "Yolo-paddle - Book Padel Courts Quickly & Easily",
    description: "Find, check schedules, and book your favorite padel courts on Yolo-paddle!",
    images: [
      {
        url: 'https://www.yolo-padel.com/opengraph-image.webp',
        width: 1200,
        height: 630,
        alt: 'Booking a Padel Court on Yolo-paddle',
      },
    ],
    siteName: 'Yolo-paddle',
    type: 'website',
    locale: 'en_US', // Change as needed
  },
  // Add Twitter card
  twitter: {
    card: 'summary_large_image',
    title: "Yolo-paddle - Book Padel Courts Quickly & Easily",
    description: "Find, check schedules, and book your favorite padel courts on Yolo-paddle!",
    images: ['https://www.yolo-padel.com/twitter-image.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
