/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Data Ekstrakurikuler.
 *         Berfungsi sebagai wrapper server-side yang menetapkan metadata halaman
 *         dan memuat komponen client-side DataEkstrakurikulerClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import DataEkstrakurikulerClient from './components/ekstrakurikuler_client';

export const metadata: Metadata = {
  title: 'Ekstrakurikuler', 
};

export default function DataEkstrakurikulerPage() {
  return <DataEkstrakurikulerClient />;
}