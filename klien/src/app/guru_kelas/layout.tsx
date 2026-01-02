// File: layout.tsx
// Fungsi: Layout utama untuk seluruh halaman di rute guru kelas.
//         Menyediakan struktur dasar seperti navbar, sidebar, dan konten dinamis.
// Pembuat: Frima Rizky Lianda - NIM: 3312401016
// Tanggal: 15 September 2025

import type { Metadata } from "next";
import GuruKelasLayout from './components/Layout';

export const metadata: Metadata = {
    title: {
        template: "Guru Kelas - %s",
        default: "Guru Kelas",
    },
    description: "Kelola Data Siswa Berdasarkan Kelas",
};

export default function GuruKelasRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuruKelasLayout>{children}</GuruKelasLayout>;
}