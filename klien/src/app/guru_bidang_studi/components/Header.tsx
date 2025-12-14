'use client';

import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
    id: number;
    nama_lengkap: string;
    email_sekolah: string;
    role: string;
    subject?: string; // 👈 tambahkan ini untuk mata pelajaran
}

interface HeaderProps {
    user: UserData;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    const handleProfile = () => {
        router.push('/guru_bidang_studi/profil'); // 👈 ubah ke profil guru bidang studi
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        {/* 👇 Ubah judul dan tambahkan mata pelajaran */}
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru Bidang Studi</h1>
                        <p className="text-sm text-gray-500">
                            {user.subject ? `Mata Pelajaran: ${user.subject}` : ''}
                        </p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                const dropdown = document.getElementById('profile-dropdown-guru');
                                if (dropdown) dropdown.classList.toggle('hidden');
                            }}
                            className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.nama_lengkap}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>

                            {/* ✅ Avatar berbasis inisial — tetap sama */}
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-black">
                                {(user.nama_lengkap || '??')
                                    .split(' ')
                                    .slice(0, 2)
                                    .map(word => word[0]?.toUpperCase() || '')
                                    .join('') || '??'}
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>

                        <div
                            id="profile-dropdown-guru"
                            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden"
                        >
                            <div className="p-4 border-b border-gray-200">
                                <p className="font-semibold text-gray-900">{user.nama_lengkap}</p>
                                <p className="text-sm text-gray-500">{user.email_sekolah}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                    {user.role.toUpperCase()} {user.subject && `• ${user.subject}`}
                                </span>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={handleProfile}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">Profil Saya</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}