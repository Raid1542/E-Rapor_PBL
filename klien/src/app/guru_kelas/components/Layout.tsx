// app/guru_kelas/components/Layout.tsx
'use client';

import { useState, useEffect } from 'react';
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
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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