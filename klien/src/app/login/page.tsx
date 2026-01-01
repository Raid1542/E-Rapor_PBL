/**
 * Nama File: page.tsx
 * Fungsi: Halaman utama untuk proses autentikasi pengguna (login).
 *         Merender komponen klien LoginClient yang menangani formulir dan logika interaksi.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 15 September 2025
 */

import { Metadata } from 'next';
import LoginClient from './components/login_client';

export const metadata: Metadata = {
  title: 'E-Rapor - Login',
};

export default function LoginPage() {
  return <LoginClient />;
}