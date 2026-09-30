import type { Metadata } from "next";
import { Gabarito, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/shared/toaster";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boowat",
  description: "Sistem manajemen proyek dan klien Boowat.com",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${gabarito.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-sm">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
