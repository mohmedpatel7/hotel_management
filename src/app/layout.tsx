import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/lib/clientProvider/ClientProviders";
import Sidebar from "@/components/Slidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotel Mumtaz Chicken",
  description: "",
};

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
        <ClientProviders>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-60 transition-all duration-300">
              {children}
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
