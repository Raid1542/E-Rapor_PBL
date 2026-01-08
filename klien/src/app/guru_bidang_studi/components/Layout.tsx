/**
 * Nama File: Layout.tsx
 * Fungsi: Komponen klien layout untuk guru bidang studi,
 *         mencakup sidebar navigasi, header profil, dan area konten utama.
 *         Memastikan pengguna telah login dengan memeriksa keberadaan token
 *         di localStorage. Jika belum login, pengguna diarahkan ke halaman login
 *         dengan menyertakan URL asal melalui query parameter 'redirect'.
 *         Menampilkan indikator loading selama sesi diverifikasi.
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
    subject?: string;
}

export default function GuruBidangStudiLayout({
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
                console.warn('Data pengguna di localStorage tidak valid');
            }
        }

        setLoading(false);
    }, [router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600 mx-auto mb-3"></div>
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