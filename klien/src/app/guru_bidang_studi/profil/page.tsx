/**
 * Nama File: page.tsx
 * Fungsi: Halaman server untuk profil guru bidang studi.
 *         Merender komponen klien ProfilClient yang menangani tampilan dan pengeditan data profil pengguna.
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