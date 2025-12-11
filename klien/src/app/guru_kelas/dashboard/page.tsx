'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  class?: string;
}

interface KelasResponse {
  kelas: string;
  jumlah_siswa: number;
  tahun_ajaran: string;
}

export default function GuruDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [kelasInfo, setKelasInfo] = useState<KelasResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      if (parsedUser.role !== 'guru kelas') {
        alert('Akses ditolak: Anda bukan guru kelas');
        router.push('/login');
        return;
      }

      setUser(parsedUser);

      const fetchKelas = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/guru-kelas/kelas', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const kelasData: KelasResponse = await response.json();
            setKelasInfo(kelasData);
          } else {
            const error = await response.json();
            console.error('Error:', error.message || 'Gagal memuat data kelas');
          }
        } catch (err) {
          console.error('Fetch error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchKelas();
    } catch (e) {
      console.error('Error parsing user data:', e);
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data kelas...</p>
        </div>
      </div>
    );
  }

  if (!user || !kelasInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Gagal memuat data kelas.</p>
          <button 
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {user.name}! 👋
        </h2>
        <p className="text-orange-100">
          Anda login sebagai Guru Kelas <strong>{kelasInfo.kelas}</strong>. Kelola data siswa dan rapor dengan mudah.
        </p>
      </div>

      {/* Menu Cards — Hanya 2 Kolom Sekarang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> {/* Tambahkan mb-8 untuk jarak ke bawah */}
        {/* Card Kelola Data */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kelola Data</p>
              <p className="text-3xl font-bold text-gray-900">6</p>
              <p className="text-xs text-gray-500 mt-1">Menu tersedia</p>
            </div>
          </div>
        </div>

        {/* Card Rapor */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rapor</p>
              <p className="text-3xl font-bold text-gray-900">{kelasInfo.jumlah_siswa}</p>
              <p className="text-xs text-gray-500 mt-1">Rapor tersedia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Kelas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Kelas</p>
            <p className="text-xl font-bold text-gray-900">{kelasInfo.kelas}</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Jumlah Siswa</p>
            <p className="text-xl font-bold text-gray-900">{kelasInfo.jumlah_siswa} Siswa</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Tahun Ajaran</p>
            <p className="text-xl font-bold text-gray-900">{kelasInfo.tahun_ajaran}</p>
          </div>
        </div>
      </div>
    </main>
  );
}