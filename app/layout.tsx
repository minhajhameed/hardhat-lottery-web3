"use client"  /* had to do this as packages are old (for nextjs 12) */ 

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MoralisProvider initializeOnMount={false}>

        <NotificationProvider>
        {children}
        </NotificationProvider>
        </MoralisProvider>
      </body>
    </html>
  );
}
