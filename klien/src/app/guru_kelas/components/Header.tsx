/**
 * Nama File: Header.tsx
 * Fungsi: Menampilkan header halaman guru kelas yang mencakup judul dashboard,
 *         nama kelas yang diajar, serta dropdown profil pengguna.
 *         Dropdown menampilkan foto profil, nama, email, peran, dan opsi
 *         navigasi ke Profil atau Logout. Mendukung penutupan otomatis
 *         saat klik di luar area dropdown.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    class?: string;
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
                        const imgUrl = userData.profileImage.startsWith('/')
                            ? `${baseUrl}${userData.profileImage}`
                            : `${baseUrl}/${userData.profileImage}`;
                        setProfileImage(imgUrl);
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

    const handleProfile = () => {
        closeDropdown();
        router.push('/guru_kelas/profil');
    };

    // Tutup dropdown saat klik di luar
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
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru Kelas</h1>
                        <p className="text-sm text-gray-500">{user.class ? `Kelas ${user.class}` : ''}</p>
                    </div>

                    <div className="relative">
                        {/*  Tombol hanya berisi avatar + chevron */}
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            {/* Avatar */}
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
                                        {(user.name || '??')
                                            .split(' ')
                                            .slice(0, 2)
                                            .map(word => word[0]?.toUpperCase() || '')
                                            .join('') || '??'}
                                    </span>
                                )}
                            </div>

                            {/* Chevron Down */}
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>

                        {/* Dropdown */}
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 min-w-[200px] max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden"
                        >
                            <div className="p-4 border-b border-gray-200">
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500 break-all truncate max-w-full" title={user.email}>
                                    {user.email}
                                </p>
                                <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                    {user.role.toUpperCase()} {user.class && `– Kelas ${user.class}`}
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