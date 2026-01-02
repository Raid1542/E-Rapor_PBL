// File: page.tsx
// Fungsi: Halaman route untuk menampilkan rekapan nilai rapor kelas.
//         Mengimpor komponen client untuk tabel, pencarian, dan ekspor.
// Pembuat: Raid Aqil Athallah - NIM: 3312401022
// Tanggal: 15 September 2025 

import { Metadata } from 'next';
import RekapanNilaiClient from './components/rekapan_nilai_client';

export const metadata: Metadata = {
    title: 'Rekapan Nilai',
};

export default function RekapanNilaiGuruKelasPage() {
    return <RekapanNilaiClient />;
}