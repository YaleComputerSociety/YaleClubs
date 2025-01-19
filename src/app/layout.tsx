import type { Metadata } from "next";
import CustomFont from "next/font/local";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = CustomFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = CustomFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Yale Clubs",
  description: "With Yale Clubs, finding clubs has never been easier",
  icons: {
    icon: "assets/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
      <GoogleAnalytics gaId="G-XCG2T9LY5T" />
    </html>
  );
}
