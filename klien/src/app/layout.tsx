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