/**
 * Nama File: Layout.tsx
 * Fungsi: Menyusun tata letak halaman utama untuk guru kelas.
 *         Menggabungkan Sidebar di kiri, Header di atas, dan konten utama di tengah.
 *         Mengambil data pengguna dari localStorage dan meneruskannya ke komponen
 *         Sidebar dan Header sebagai props. Menampilkan indikator loading
 *         saat data pengguna belum tersedia.
 *         Juga memastikan pengguna telah login melalui keberadaan token;
 *         jika tidak, mengarahkan ke halaman login.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Header from './Header';
import Sidebar from './Sidebar';

interface UserData {
    id: number;
    nama_lengkap: string;
    email_sekolah: string;
    role: string;
    class?: string;
}

export default function GuruKelasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter(); // ← tambahkan ini
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('currentUser');

        // Jika tidak ada token, redirect ke login
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
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mx-auto mb-3"></div>
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
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}