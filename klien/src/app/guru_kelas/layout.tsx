'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/admin/components/Header';
import Sidebar from '@/app/admin/components/Sidebar'; // Jika ada
import { useRouter } from 'next/navigation';

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
    const [user, setUser] = useState<UserData | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('currentUser');

        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (userData) {
            const parsedUser: UserData = JSON.parse(userData);
            if (parsedUser.role !== 'guru kelas') {
                alert('Anda tidak memiliki akses ke halaman ini');
                window.location.href = '/login';
                return;
            }
            setUser(parsedUser);
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
        }
        setProfileOpen(false);
        router.push('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header
                    user={user}
                    profileOpen={profileOpen}
                    setProfileOpen={setProfileOpen}
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}