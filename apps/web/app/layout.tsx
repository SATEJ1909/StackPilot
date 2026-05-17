import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f6f7f9] text-[#15171a]">{children}</body>
    </html>
  );
}
