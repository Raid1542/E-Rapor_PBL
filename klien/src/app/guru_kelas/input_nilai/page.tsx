/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Input Nilai.
 *         Memuat komponen client-side DataInputNilaiClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataInputNilaiClient from './components/input_nilai';

export const meta: Metadata = {
    title: 'Input Nilai',
};

export default function DataInputNilaiPage() {
    return <DataInputNilaiClient />;
}