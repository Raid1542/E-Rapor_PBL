/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Data Tahun Ajaran.
 *         Berfungsi sebagai wrapper server-side yang menetapkan metadata halaman
 *         dan memuat komponen client-side DataTahunAjaranClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataTahunAjaranClient from './components/data_tahun_ajaran_client';

export const metadata: Metadata = {
  title: 'Data Tahun Ajaran', 
};

export default function DataTahunAjaranPage() {
  return <DataTahunAjaranClient />;
}