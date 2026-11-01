import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NXNative Cloud Studio - Switch to iOS IPA Compiler",
  description: "Web compiler and cloud automation pipeline for converting legally dumped Nintendo Switch games to native iOS / iPadOS IPAs using seedds/nxnative and GitHub Actions runners.",
  keywords: ["nxnative", "ipa-builder", "switch to ipa", "ios gaming", "metal", "apple silicon", "nsp to ipa", "homebrew"],
  authors: [{ name: "NXNative Community" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0d13] text-gray-100 antialiased selection:bg-red-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
