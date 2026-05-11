<<<<<<< HEAD
=======
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StackPilot",
  description: "AI-powered error monitoring for product teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className={`min-h-full bg-[#f6f7f9] text-[#15171a] ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
>>>>>>> dev
