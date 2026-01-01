/**
 * Nama File: layout.tsx
 * Fungsi: Layout utama aplikasi E-Rapor.
 *         Menyediakan struktur dasar HTML, metadata, dan wrapper untuk semua halaman.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Rapor",
  description: "Sistem Informasi Akademik SDIT Ulil Albab",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}