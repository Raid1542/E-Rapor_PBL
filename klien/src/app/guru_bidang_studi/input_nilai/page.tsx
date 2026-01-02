/**
 * Nama File: page.tsx
 * Fungsi: Halaman server untuk input nilai akademik oleh guru bidang studi.
 *         Merender komponen klien InputNilaiClient yang menangani tampilan dan logika interaksi data nilai.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import InputNilaiClient from './components/input_nilai_client';

export const metadata: Metadata = {
    title: 'Input Nilai',
};

export default function DataInputNilaiPage() {
    return <InputNilaiClient />;
}