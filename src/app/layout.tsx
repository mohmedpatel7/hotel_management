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
  manifest: "/manifest.json",
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
          <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-72 transition-all duration-500 ease-in-out">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
