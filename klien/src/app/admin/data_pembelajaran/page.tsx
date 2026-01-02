/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Data Pembelajaran.
 *         Berfungsi sebagai entry point server-side yang menetapkan metadata halaman
 *         dan memuat komponen client-side DataPembelajaranClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataPembelajaranClient from './components/data_pembelajaran_client';

export const metadata: Metadata = {
  title: 'Data Pembelajaran', 
};

export default function DataPembelajaranPage() {
  return <DataPembelajaranClient />;
}