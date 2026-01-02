/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk menampilkan Data Mata Pelajaran.
 *         Bertindak sebagai wrapper yang menyertakan metadata halaman
 *         dan memuat komponen client-side DataMapelClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataMapelClient from './components/data_mata_pelajaran_client';

export const metadata: Metadata = {
  title: 'Data Mata Pelajaran', 
};

export default function DataMataPelajaranPage() {
  return <DataMapelClient />;
}