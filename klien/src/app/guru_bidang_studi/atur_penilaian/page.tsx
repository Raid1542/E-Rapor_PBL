/**
 * Nama File: page.tsx
 * Fungsi: Halaman server untuk mengatur penilaian oleh guru bidang studi.
 *         Merender komponen klien AturPenilaianClient yang menangani UI dan logika interaksi.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import AturPenilaianClient from './components/atur_penilaian_client';

export const metadata: Metadata = {
    title: 'Atur Penilaian',
};

export default function AturPenilaianPage() {
    return <AturPenilaianClient />;
}