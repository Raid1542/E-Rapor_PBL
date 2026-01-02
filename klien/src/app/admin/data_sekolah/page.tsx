/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Data Sekolah.
 *         Bertindak sebagai wrapper server-side yang menetapkan metadata halaman
 *         dan memuat komponen client-side DataSekolahClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataSekolahClient from './components/data_sekolah_client';

export const metadata: Metadata = {
  title: 'Data Sekolah', 
};

export default function DataSekolahPage() {
  return <DataSekolahClient />;
}