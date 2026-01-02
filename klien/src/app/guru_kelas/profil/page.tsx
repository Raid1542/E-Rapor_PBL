// File: page.tsx
// Fungsi: Halaman route untuk profil pengguna.
//         Mengimpor komponen client untuk interaksi edit profil & password.
// Pembuat: Raid Aqil Athallah - NIM: 3312401022
// Tanggal: 15 September 2025

import { Metadata } from 'next';
import ProfilClient from './components/profil_client';

export const metadata: Metadata = {
    title: 'Profil',
};

export default function ProfilePage() {
    return <ProfilClient />;
}