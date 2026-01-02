/**
 * Nama File: page.tsx
 * Fungsi: Halaman rute Next.js untuk Profil Pengguna.
 *         Berfungsi sebagai wrapper server-side yang menetapkan metadata halaman
 *         dan memuat komponen client-side ProfilClient.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import ProfilClient from './components/profil_client';

export const metadata: Metadata = {
  title: 'Profil',
};

export default function ProfilePage() {
  return <ProfilClient />;
}