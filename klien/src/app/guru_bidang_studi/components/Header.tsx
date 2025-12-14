'use client';

import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface UserData {
    id: number;
    nama_lengkap: string;
    email_sekolah: string;
    role: string;
    // class tidak digunakan untuk guru bidang studi → dihapus
    profileImage?: string;
}

interface HeaderProps {
    user: UserData;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Muat foto profil
    useEffect(() => {
        const loadProfileImage = () => {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData.profileImage) {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                        setProfileImage(baseUrl + userData.profileImage);
                    } else {
                        setProfileImage(null);
                    }
                }
            } catch (e) {
                console.error('Gagal memuat foto profil:', e);
                setProfileImage(null);
            }
        };

        loadProfileImage();

        const handleProfileUpdate = () => loadProfileImage();
        window.addEventListener('userDataUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('userDataUpdated', handleProfileUpdate);
        };
    }, []);

    const toggleDropdown = () => {
        const dropdown = dropdownRef.current;
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    };

    const closeDropdown = () => {
        const dropdown = dropdownRef.current;
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    };

    const handleLogout = () => {
        closeDropdown();
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    // ✅ Arahkan ke profil guru bidang studi
    const handleProfile = () => {
        closeDropdown();
        router.push('/guru_bidang_studi/profil');
    };

    // Klik di luar dropdown → tutup
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        {/* ✅ Judul khusus guru bidang studi */}
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru Bidang Studi</h1>
                        {/* Tidak ada info kelas → dihapus */}
                    </div>

                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.nama_lengkap}</p>
                                {/* ✅ Tampilkan role dengan benar (spasi, bukan underscore) */}
                                <p className="text-xs text-gray-500 capitalize">
                                    {user.role === 'guru bidang studi' ? 'Guru Bidang Studi' : user.role}
                                </p>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Foto Profil"
                                        className="w-full h-full object-cover"
                                        onError={() => setProfileImage(null)}
                                    />
                                ) : (
                                    <span className="text-black text-xs font-semibold">
                                        {(user.nama_lengkap || '??')
                                            .split(' ')
                                            .slice(0, 2)
                                            .map(word => word[0]?.toUpperCase() || '')
                                            .join('') || '??'}
                                    </span>
                                )}
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>

                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden"
                        >
                            <div className="p-4 border-b border-gray-200">
                                <p className="font-semibold text-gray-900">{user.nama_lengkap}</p>
                                <p className="text-sm text-gray-500">{user.email_sekolah}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {/* ✅ Warna & teks sesuai role */}
                                    {user.role === 'guru bidang studi' ? 'GURU BIDANG STUDI' : user.role.toUpperCase()}
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