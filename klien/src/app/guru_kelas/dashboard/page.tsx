'use client';

import { useState, useEffect } from 'react';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  class?: string;
}

export default function GuruDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulasi data user untuk demo
    const mockUser: UserData = {
      id: '1',
      name: 'Budi Santoso',
      email: 'budi.santoso@sditulilalbab.sch.id',
      role: 'guru',
      class: 'X-A'
    };
    
    setUser(mockUser);
    setLoading(false);

    // Kode untuk koneksi login (uncomment saat implementasi):
    /*
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      const parsedUser: UserData = JSON.parse(userData);
      
      if (parsedUser.role !== 'guru') {
        alert('Anda tidak memiliki akses ke halaman ini');
        window.location.href = '/login';
        return;
      }
      
      setUser(parsedUser);
    }
    
    setLoading(false);
    */
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {user.name}! 👋
        </h2>
        <p className="text-orange-100">
          Anda login sebagai Guru Kelas {user.class}. Kelola data siswa dan rapor dengan mudah.
        </p>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Kelola Data */}
        <div 
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kelola Data</p>
              <p className="text-3xl font-bold text-gray-900">6</p>
              <p className="text-xs text-gray-500 mt-1">Menu tersedia</p>
            </div>
          </div>
        </div>

        {/* Card Rapor */}
        <div 
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rapor</p>
              <p className="text-3xl font-bold text-gray-900">32</p>
              <p className="text-xs text-gray-500 mt-1">Rapor tersedia</p>
            </div>
          </div>
        </div>

        {/* Card Profil */}
        <div 
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Profil</p>
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Kelas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Kelas</p>
            <p className="text-xl font-bold text-gray-900">{user.class}</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Jumlah Siswa</p>
            <p className="text-xl font-bold text-gray-900">32 Siswa</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Tahun Ajaran</p>
            <p className="text-xl font-bold text-gray-900">2024/2025</p>
          </div>
        </div>
      </div>
    </main>
  );
}