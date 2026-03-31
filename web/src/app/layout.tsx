import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

const fraunces = Fraunces({ 
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: 'swap',
  weight: ['300', '600', '700'],
  style: ['normal', 'italic'],
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: "CVCraft — CV yang Bicara untuk Kamu",
  description: "Buat CV dan Surat Lamaran yang teroptimasi ATS secara otomatis dengan kecerdasan buatan. Tingkatkan peluang karir Anda sekarang.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${outfit.variable} scroll-smooth`}>
      <body className="antialiased selection:bg-primary/30 min-h-screen font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
