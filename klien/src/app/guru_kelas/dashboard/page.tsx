// app/guru_kelas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface UserData {
  id: string;
  nama_lengkap: string;
  email_sekolah: string;
  role: string;
  kelas?: string;
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

      setUser(parsedUser); // ✅ parsedUser punya `nama_lengkap`, bukan `name`

      const fetchKelas = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/guru-kelas/kelas', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json(); // Ini array

            if (Array.isArray(data) && data.length > 0) {
              const kelasData: KelasResponse = data[0]; // Ambil elemen pertama
              setKelasInfo(kelasData);
            } else {
              console.error('Data kelas kosong atau bukan array');
              setKelasInfo(null);
            }
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
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!kelasInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Anda belum ditugaskan sebagai guru kelas.
          </h2>
          <p className="text-gray-600 text-sm">
            Silakan hubungi admin untuk penugasan ke kelas pada tahun ajaran ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {user.nama_lengkap || 'Guru'}! 👋
        </h2>
        <p className="text-orange-100">
          Anda login sebagai <strong>Guru Kelas {kelasInfo.kelas}</strong>. Kelola data siswa dan rapor dengan mudah.
        </p>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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