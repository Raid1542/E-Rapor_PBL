/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Dashboard Guru Kelas.
 *         Memuat komponen client-side GuruKelasDashboardClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import GuruKelasDashboardClient from './components/dashboard_client';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function GuruKelasDashboard() {
    return <GuruKelasDashboardClient />;
}