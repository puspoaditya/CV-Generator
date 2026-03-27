import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HireReady.ai - Generator CV & Surat Lamaran AI",
  description: "Buat CV dan Surat Lamaran yang teroptimasi ATS secara otomatis dengan kecerdasan buatan. Tingkatkan peluang karir Anda sekarang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.className} antialiased selection:bg-primary/30 min-h-screen bg-[#020617]`}>
        {children}
      </body>
    </html>
  );
}
