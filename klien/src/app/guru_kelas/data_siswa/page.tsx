/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Data Siswa versi guru kelas.
 *         Memuat komponen client-side DataSiswaClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataSiswaClient from './components/data_siswa_client';

export const metadata: Metadata = {
    title: 'Data Siswa',
};

export default function DataSiswaPage() {
    return <DataSiswaClient />;
}