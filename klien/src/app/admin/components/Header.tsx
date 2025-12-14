'use client';

import { LogOut, ChevronDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserData {
  id: number;
  nama_lengkap: string;
  email_sekolah: string;
  role: string;
  profileImage?: string;
}

// Fungsi bantu: ambil inisial dari nama
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
};

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Muat data user & foto profil dari localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData: UserData = JSON.parse(storedUser);
          setUser(userData);

          // Set URL foto profil
          if (userData.profileImage) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            setProfileImage(baseUrl + userData.profileImage);
          } else {
            setProfileImage(null);
          }
        } else {
          setUser(null);
          setProfileImage(null);
        }
      } catch (e) {
        console.error('Gagal memuat data user:', e);
        setUser(null);
        setProfileImage(null);
      }
    };

    loadUserData();

    const fallbackInterval = setInterval(() => {
      const stored = localStorage.getItem('currentUser');
      if (stored && !user) {
        loadUserData();
      }
    }, 500);


    // Dengarkan update dari profil page
    const handleUserUpdate = () => {
      loadUserData();
    };

    window.addEventListener('userDataUpdated', handleUserUpdate);
    window.addEventListener('profileImageUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdate);
      window.removeEventListener('profileImageUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
    }
    router.push('/login');
  };

  const handleProfile = () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden'); 
    }

    // Lalu redirect
    router.push('/admin/profil');
  };


  const toggleDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
  };

  // Jika user belum ada, tampilkan loading ringan (opsional)
  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          </div>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nama_lengkap}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>

              {/* Avatar: Foto Profil atau Inisial */}
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
                    {getInitials(user.nama_lengkap)}
                  </span>
                )}
              </div>

              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            <div
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">{user.nama_lengkap}</p>
                <p className="text-sm text-gray-500">{user.email_sekolah}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div className="p-2">
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