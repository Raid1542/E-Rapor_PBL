/**
 * Nama File: Layout.tsx
 * Fungsi: Layout utama halaman admin yang menyusun struktur halaman
 *         dengan Sidebar di kiri dan Header di atas konten utama.
 *         Mengambil data pengguna dari localStorage dan mengirimkannya
 *         ke komponen Sidebar dan Header sebagai props.
 *         Melindungi akses halaman dengan memeriksa token autentikasi.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Sidebar from './Sidebar';
import Header from './Header';

interface UserData {
  id: number;
  nama_lengkap: string;
  email_sekolah: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); 
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');

    if (!token) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.warn('Invalid user data in localStorage');
      }
    }

    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}