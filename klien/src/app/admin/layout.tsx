/**
 * Nama File: layout.tsx
 * Fungsi: Layout utama untuk seluruh halaman admin.
 *         Menyediakan struktur kerangka aplikasi seperti sidebar, header, dan konten.
 *         Menetapkan metadata default untuk semua halaman di dalam rute admin.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

import type { Metadata } from "next";
import "../globals.css"; 
import Layout from "@/app/admin/components/Layout";

export const metadata: Metadata = {
  title: {
    template: "Admin - %s", 
    default: "Admin",       
  },
  description: "Panel administrasi sistem E-Rapor sekolah",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}